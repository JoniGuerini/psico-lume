import type { SessionFrequency } from "@/data/types"

export const DEFAULT_SESSION_FREQUENCY: SessionFrequency = "4x-mes"

export const sessionFrequencyOptions: {
  value: SessionFrequency
  label: string
  description: string
}[] = [
  {
    value: "1x-mes",
    label: "1x ao mês",
    description: "1 sessão por mês",
  },
  {
    value: "2x-mes",
    label: "2x ao mês",
    description: "Quinzenal — a cada 2 semanas",
  },
  {
    value: "3x-mes",
    label: "3x ao mês",
    description: "3 sessões por mês",
  },
  {
    value: "4x-mes",
    label: "4x ao mês",
    description: "Semanal — toda semana",
  },
]

/** Valores legados antes da unificação por sessões/mês. */
const LEGACY_FREQUENCY_MAP: Record<string, SessionFrequency> = {
  semanal: "4x-mes",
  quinzenal: "2x-mes",
}

export function normalizeSessionFrequency(
  frequency: SessionFrequency | string | undefined
): SessionFrequency {
  if (!frequency) return DEFAULT_SESSION_FREQUENCY
  if (frequency in LEGACY_FREQUENCY_MAP) {
    return LEGACY_FREQUENCY_MAP[frequency]
  }
  return frequency as SessionFrequency
}

export function sessionFrequencyLabel(
  frequency: SessionFrequency | string | undefined
): string {
  const normalized = normalizeSessionFrequency(frequency)
  return (
    sessionFrequencyOptions.find((option) => option.value === normalized)
      ?.label ?? "4x ao mês"
  )
}

function getIsoWeek(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = copy.getDay() || 7
  copy.setDate(copy.getDate() + 4 - day)
  const yearStart = new Date(copy.getFullYear(), 0, 1)
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

/** Qual ocorrência do dia da semana no mês (1ª terça, 2ª terça…). */
function getWeekdayOccurrenceInMonth(date: Date) {
  let count = 0
  const targetDay = date.getDay()
  for (let day = 1; day <= date.getDate(); day++) {
    const cursor = new Date(date.getFullYear(), date.getMonth(), day)
    if (cursor.getDay() === targetDay) count++
  }
  return count
}

export function shouldIncludeRecurringDate(
  frequency: SessionFrequency | string | undefined,
  date: Date,
  anchor = new Date()
): boolean {
  const freq = normalizeSessionFrequency(frequency)

  switch (freq) {
    case "1x-mes":
      return getWeekdayOccurrenceInMonth(date) === 1
    case "2x-mes":
      return getIsoWeek(date) % 2 === getIsoWeek(anchor) % 2
    case "3x-mes":
      return getWeekdayOccurrenceInMonth(date) <= 3
    case "4x-mes":
      return true
  }
}
