import type { PatientStatus, SessionStatus } from "@/data/types"
import type { ExportRow, StyledSheetConfig } from "@/lib/clinic-export-xlsx"

/** Cores hex alinhadas ao tema Lume / export XLSX. */
export const SHEET_COLORS = {
  headerBg: "#1B3A5C",
  headerText: "#FAF6EC",
  border: "#E5E0D5",
  zebra: "#F8F6F0",
  card: "#FFFFFF",
  overdue: "#FEE2E2",
  overdueText: "#B91C1C",
  metricLabel: "#1B3A5C",
} as const

export const sessionStatusFill: Record<SessionStatus, string> = {
  agendada: "#F8F6F0",
  realizada: "#EAF5EF",
  faltou: "#FEE2E2",
  remarcada: "#E8EEF5",
  cancelada: "#F3F4F6",
}

export const patientStatusFill: Record<PatientStatus, string> = {
  ativo: "#EAF5EF",
  "em-pausa": "#FEF3C7",
  "lista-espera": "#E0F2FE",
  alta: "#F3F4F6",
}

export type SheetCellStyle = {
  backgroundColor: string
  color: string
  fontWeight: "normal" | "bold"
  textDecoration?: "line-through"
}

export function getSheetHeaders(rows: ExportRow[]) {
  if (rows.length === 0) return ["Nenhum registro"]
  return Object.keys(rows[0]).filter((key) => !key.startsWith("_"))
}

function baseCellStyle(
  backgroundColor: string,
  color = "#1B3A5C",
  fontWeight: "normal" | "bold" = "normal"
): SheetCellStyle {
  return { backgroundColor, color, fontWeight }
}

export function resolveRowStyle(
  row: ExportRow,
  config: StyledSheetConfig,
  rowIndex: number
): SheetCellStyle {
  const sessionStatus = row._sessionStatus as SessionStatus | undefined
  if (sessionStatus && config.sessionStatusKey) {
    const style = baseCellStyle(sessionStatusFill[sessionStatus])
    if (sessionStatus === "faltou" || sessionStatus === "cancelada") {
      return {
        ...style,
        color: sessionStatus === "faltou" ? SHEET_COLORS.overdueText : "#6B7280",
        textDecoration: "line-through",
      }
    }
    return style
  }

  if (
    config.overdueColumn &&
    String(row[config.overdueColumn] ?? "").toLowerCase() === "sim"
  ) {
    return baseCellStyle(SHEET_COLORS.overdue, SHEET_COLORS.overdueText, "bold")
  }

  const isZebra = rowIndex % 2 === 1
  return baseCellStyle(isZebra ? SHEET_COLORS.zebra : SHEET_COLORS.card)
}

export function resolveCellStyle(
  row: ExportRow,
  config: StyledSheetConfig,
  header: string,
  rowStyle: SheetCellStyle
): SheetCellStyle {
  if (
    config.patientStatusColumn &&
    config.patientStatusKey &&
    header === config.patientStatusColumn
  ) {
    const patientStatus = row._patientStatus as PatientStatus | undefined
    if (patientStatus) {
      return {
        backgroundColor: patientStatusFill[patientStatus],
        color: "#1B3A5C",
        fontWeight: "bold",
      }
    }
  }

  if (config.name === "Resumo" && header === "Métrica") {
    return {
      ...rowStyle,
      color: SHEET_COLORS.metricLabel,
      fontWeight: "bold",
    }
  }

  if (
    config.name === "Resumo" &&
    String(row.Métrica ?? "").toLowerCase().includes("atraso")
  ) {
    return baseCellStyle(SHEET_COLORS.overdue, SHEET_COLORS.overdueText, "bold")
  }

  return rowStyle
}

export function isNumericColumn(header: string, rows: ExportRow[]) {
  if (rows.length === 0) return false
  const sample = rows.find((row) => row[header] !== "" && row[header] != null)
  return typeof sample?.[header] === "number"
}

export function isWrapColumn(header: string) {
  return header === "Evolução" || header === "Resumo" || header === "Plano"
}
