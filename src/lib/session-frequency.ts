import type { SessionFrequency } from "@/data/types"

export const DEFAULT_SESSION_FREQUENCY: SessionFrequency = "semanal"

export const sessionFrequencyOptions: {
  value: SessionFrequency
  label: string
  description: string
}[] = [
  {
    value: "semanal",
    label: "Semanal",
    description: "1 sessão por semana",
  },
  {
    value: "quinzenal",
    label: "Quinzenal",
    description: "A cada 2 semanas",
  },
  {
    value: "3x-mes",
    label: "3x ao mês",
    description: "Até 3 sessões no mês",
  },
  {
    value: "4x-mes",
    label: "4x ao mês",
    description: "Até 4 sessões no mês",
  },
]

export function sessionFrequencyLabel(
  frequency: SessionFrequency | undefined
): string {
  return (
    sessionFrequencyOptions.find(
      (option) => option.value === (frequency ?? DEFAULT_SESSION_FREQUENCY)
    )?.label ?? "Semanal"
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
  frequency: SessionFrequency | undefined,
  date: Date,
  anchor = new Date()
): boolean {
  const freq = frequency ?? DEFAULT_SESSION_FREQUENCY

  switch (freq) {
    case "semanal":
      return true
    case "quinzenal":
      return getIsoWeek(date) % 2 === getIsoWeek(anchor) % 2
    case "3x-mes":
      return getWeekdayOccurrenceInMonth(date) <= 3
    case "4x-mes":
      return getWeekdayOccurrenceInMonth(date) <= 4
    default:
      return true
  }
}
