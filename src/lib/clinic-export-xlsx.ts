import ExcelJS from "exceljs"

import type { PatientStatus, SessionStatus } from "@/data/types"

/** Cores alinhadas ao tema Lume (ARGB para Excel). */
export const EXPORT_COLORS = {
  headerBg: "FF1B3A5C",
  headerText: "FFFAF6EC",
  border: "FFE5E0D5",
  zebra: "FFF8F6F0",
  card: "FFFFFFFF",
  overdue: "FFFEE2E2",
  overdueText: "FFB91C1C",
  metricLabel: "FF1B3A5C",
} as const

export const sessionStatusExcelFill: Record<SessionStatus, string> = {
  agendada: "FFF8F6F0",
  realizada: "FFEAF5EF",
  faltou: "FFFEE2E2",
  remarcada: "FFE8EEF5",
  cancelada: "FFF3F4F6",
}

export const sessionStatusExcelFont: Partial<
  Record<SessionStatus, Partial<ExcelJS.Font>>
> = {
  faltou: { color: { argb: "FFB91C1C" }, strike: true },
  cancelada: { color: { argb: "FF6B7280" }, strike: true },
}

export const patientStatusExcelFill: Record<PatientStatus, string> = {
  ativo: "FFEAF5EF",
  "em-pausa": "FFFEF3C7",
  "lista-espera": "FFE0F2FE",
  alta: "FFF3F4F6",
}

export type ExportRow = Record<string, string | number | boolean | undefined>

export type StyledSheetConfig = {
  name: string
  rows: ExportRow[]
  /** Coluna com label de status de sessão para pintar a linha inteira. */
  sessionStatusKey?: "_sessionStatus"
  /** Coluna Inadimplente — destaca linha quando "Sim". */
  overdueColumn?: string
  /** Coluna Status do paciente — pinta célula do status. */
  patientStatusColumn?: string
  patientStatusKey?: "_patientStatus"
}

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: EXPORT_COLORS.border } },
  left: { style: "thin", color: { argb: EXPORT_COLORS.border } },
  bottom: { style: "thin", color: { argb: EXPORT_COLORS.border } },
  right: { style: "thin", color: { argb: EXPORT_COLORS.border } },
}

function getHeaders(rows: ExportRow[]) {
  if (rows.length === 0) return ["Nenhum registro"]
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
    String(row[config.overdueColumn] ?? "").toLowerCase() === "sim"
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

  const headers = getHeaders(config.rows)
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
    const emptyRow = worksheet.addRow(["Nenhum registro"])
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

      if (config.name === "Resumo" && colNumber === 1) {
        cellFont = { ...cellFont, bold: true, color: { argb: EXPORT_COLORS.metricLabel } }
      }

      if (
        config.name === "Resumo" &&
        String(row.Métrica ?? "").includes("atraso")
      ) {
        cellFill = EXPORT_COLORS.overdue
        cellFont = { ...cellFont, color: { argb: EXPORT_COLORS.overdueText }, bold: true }
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
        wrapText: header === "Evolução" || header === "Resumo" || header === "Plano",
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
