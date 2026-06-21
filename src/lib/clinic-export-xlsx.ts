import ExcelJS from "exceljs"

import type { PatientStatus, SessionStatus } from "@/data/types"
import { sheetPalette } from "@/lib/design-system"

/** Cores alinhadas ao tema Lume (ARGB para Excel). */
export const EXPORT_COLORS = {
  headerBg: `FF${sheetPalette.headerBg.slice(1)}`,
  headerText: `FF${sheetPalette.headerText.slice(1)}`,
  border: `FF${sheetPalette.border.slice(1)}`,
  zebra: `FF${sheetPalette.zebra.slice(1)}`,
  card: `FF${sheetPalette.card.slice(1)}`,
  overdue: `FF${sheetPalette.overdue.slice(1)}`,
  overdueText: `FF${sheetPalette.overdueText.slice(1)}`,
  metricLabel: `FF${sheetPalette.metricLabel.slice(1)}`,
} as const

export const sessionStatusExcelFill: Record<SessionStatus, string> =
  Object.fromEntries(
    Object.entries(sheetPalette.sessionStatusFill).map(([key, hex]) => [
      key,
      `FF${hex.slice(1)}`,
    ])
  ) as Record<SessionStatus, string>

export const sessionStatusExcelFont: Partial<
  Record<SessionStatus, Partial<ExcelJS.Font>>
> = {
  faltou: { color: { argb: EXPORT_COLORS.overdueText }, strike: true },
  cancelada: { color: { argb: "FF6B7280" }, strike: true },
}

export const patientStatusExcelFill: Record<PatientStatus, string> =
  Object.fromEntries(
    Object.entries(sheetPalette.patientStatusFill).map(([key, hex]) => [
      key,
      `FF${hex.slice(1)}`,
    ])
  ) as Record<PatientStatus, string>

export type ExportRow = Record<string, string | number | boolean | undefined>

export type ExportSheetKey =
  | "summary"
  | "patients"
  | "schedules"
  | "agenda"
  | "records"
  | "financePatients"
  | "financeSessions"
  | "reportHistory"
  | "reportCurrentMonth"

export type StyledSheetConfig = {
  name: string
  sheetKey: ExportSheetKey
  rows: ExportRow[]
  /** Coluna com label de status de sessão para pintar a linha inteira. */
  sessionStatusKey?: "_sessionStatus"
  /** Coluna Inadimplente — destaca linha quando igual a yesLabel. */
  overdueColumn?: string
  yesLabel?: string
  /** Coluna Status do paciente — pinta célula do status. */
  patientStatusColumn?: string
  patientStatusKey?: "_patientStatus"
  /** Cabeçalho da coluna de métrica (aba Resumo). */
  metricColumn?: string
  /** Colunas com quebra de linha no XLSX. */
  wrapColumns?: string[]
  /** Texto exibido quando a aba não tem linhas. */
  emptyLabel?: string
}

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: EXPORT_COLORS.border } },
  left: { style: "thin", color: { argb: EXPORT_COLORS.border } },
  bottom: { style: "thin", color: { argb: EXPORT_COLORS.border } },
  right: { style: "thin", color: { argb: EXPORT_COLORS.border } },
}

function getHeaders(rows: ExportRow[], emptyLabel = "Nenhum registro") {
  if (rows.length === 0) return [emptyLabel]
  return Object.keys(rows[0]).filter((key) => !key.startsWith("_"))
}

function columnWidth(header: string, rows: ExportRow[], key: string) {
  const maxCell = rows.reduce((max, row) => {
    const value = String(row[key] ?? "")
    return Math.max(max, value.length)
  }, 0)
  return Math.min(48, Math.max(header.length + 2, maxCell + 2, 12))
}

function resolveRowFill(
  row: ExportRow,
  config: StyledSheetConfig
): { fill: string; font?: Partial<ExcelJS.Font> } {
  const sessionStatus = row._sessionStatus as SessionStatus | undefined
  if (sessionStatus && config.sessionStatusKey) {
    return {
      fill: sessionStatusExcelFill[sessionStatus],
      font: sessionStatusExcelFont[sessionStatus],
    }
  }

  if (
    config.overdueColumn &&
    config.yesLabel &&
    String(row[config.overdueColumn] ?? "") === config.yesLabel
  ) {
    return {
      fill: EXPORT_COLORS.overdue,
      font: { color: { argb: EXPORT_COLORS.overdueText }, bold: true },
    }
  }

  return { fill: EXPORT_COLORS.card }
}

function addStyledSheet(
  workbook: ExcelJS.Workbook,
  config: StyledSheetConfig
) {
  const worksheet = workbook.addWorksheet(config.name, {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  const headers = getHeaders(config.rows, config.emptyLabel)
  const headerRow = worksheet.addRow(headers)

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXPORT_COLORS.headerBg },
    }
    cell.font = {
      bold: true,
      color: { argb: EXPORT_COLORS.headerText },
      size: 11,
    }
    cell.alignment = { vertical: "middle", horizontal: "left" }
    cell.border = thinBorder
  })
  headerRow.height = 22

  if (config.rows.length === 0) {
    const emptyRow = worksheet.addRow([config.emptyLabel ?? "Nenhum registro"])
    emptyRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(1, 1, 1, Math.max(headers.length, 1))
    return
  }

  config.rows.forEach((row, index) => {
    const values = headers.map((header) => row[header] ?? "")
    const dataRow = worksheet.addRow(values)
    const { fill, font } = resolveRowFill(row, config)
    const isZebra = index % 2 === 1 && fill === EXPORT_COLORS.card

    dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1]
      let cellFill = isZebra ? EXPORT_COLORS.zebra : fill
      let cellFont: Partial<ExcelJS.Font> = { ...(font ?? {}), size: 10 }

      if (
        config.patientStatusColumn &&
        config.patientStatusKey &&
        header === config.patientStatusColumn
      ) {
        const patientStatus = row._patientStatus as PatientStatus | undefined
        if (patientStatus) {
          cellFill = patientStatusExcelFill[patientStatus]
          cellFont = { ...cellFont, bold: true }
        }
      }

      if (config.sheetKey === "summary" && header === config.metricColumn) {
        cellFont = {
          ...cellFont,
          bold: true,
          color: { argb: EXPORT_COLORS.metricLabel },
        }
      }

      if (config.sheetKey === "summary" && row._summaryOverdue) {
        cellFill = EXPORT_COLORS.overdue
        cellFont = {
          ...cellFont,
          color: { argb: EXPORT_COLORS.overdueText },
          bold: true,
        }
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: cellFill },
      }
      cell.font = cellFont
      cell.border = thinBorder
      cell.alignment = {
        vertical: "top",
        horizontal: typeof cell.value === "number" ? "right" : "left",
        wrapText: config.wrapColumns?.includes(header) ?? false,
      }
    })
  })

  headers.forEach((header, index) => {
    worksheet.getColumn(index + 1).width = columnWidth(
      header,
      config.rows,
      header
    )
  })
}

export async function buildStyledWorkbookBuffer(
  sheets: StyledSheetConfig[]
) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Lume"
  workbook.created = new Date()

  for (const sheet of sheets) {
    addStyledSheet(workbook, sheet)
  }

  return workbook.xlsx.writeBuffer()
}
