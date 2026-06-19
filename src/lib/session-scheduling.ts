import type { Patient } from "@/data/types"
import { addDays } from "@/data/patients"

const weekdayCodes: Record<string, number> = {
  Dom: 0,
  Seg: 1,
  Ter: 2,
  Qua: 3,
  Qui: 4,
  Sex: 5,
  Sáb: 6,
}

const weekdayFromLabel: Record<string, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
  Domingo: "Dom",
}

export const durationOptions = [30, 45, 50, 60, 90]

export const sessionFieldClass =
  "border-border bg-background/40 hover:bg-accent/50 focus-visible:bg-card"

export function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`
}

export function fromDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(total: number) {
  const clamped = Math.max(0, Math.min(24 * 60, total))
  const hours = Math.floor(clamped / 60)
  const minutes = Math.round(clamped % 60)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function normalizeWeekdayCode(weekday: string) {
  return weekdayFromLabel[weekday] ?? weekday
}

export function nextDateForWeekday(code: string, from = new Date()) {
  const target = weekdayCodes[code]
  if (target === undefined) {
    return new Date(from.getFullYear(), from.getMonth(), from.getDate())
  }

  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  let diff = target - cursor.getDay()
  if (diff < 0) diff += 7
  return addDays(cursor, diff)
}

export function buildSessionDefaults(patient: Patient) {
  const schedule = patient.schedules?.find((row) => row.time)
  const weekdayCode = normalizeWeekdayCode(
    patient.sessionDay || schedule?.weekday || ""
  )
  const start = patient.sessionTime || schedule?.time || "09:00"
  const duration = Number(
    schedule?.duration || patient.sessionDuration || 50
  )

  return {
    date: weekdayCode ? nextDateForWeekday(weekdayCode) : new Date(),
    start,
    duration,
  }
}
