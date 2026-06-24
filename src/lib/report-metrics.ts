import type { CalendarEvent, Patient, PatientModality, SessionStatus } from "@/data/types"
import { getRevenueByModality } from "@/lib/finance-metrics"
import {
  DEMO_SESSION_STATUS_OPTIONS,
  resolveEventStatus,
  type SessionStatusOptions,
} from "@/lib/session-status"

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function patientByIdMap(patients: Patient[]) {
  return new Map(patients.map((patient) => [patient.id, patient]))
}

function isPastSession(event: CalendarEvent, anchor: Date) {
  return startOfDay(event.date) < startOfDay(anchor)
}

function pastSessionsInMonth(
  events: CalendarEvent[],
  month: Date,
  anchor: Date
) {
  return events.filter(
    (event) =>
      isPastSession(event, anchor) && isSameMonth(event.date, month)
  )
}

function countByStatus(
  events: CalendarEvent[],
  anchor: Date,
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
) {
  const counts: Record<SessionStatus, number> = {
    agendada: 0,
    realizada: 0,
    faltou: 0,
    remarcada: 0,
    cancelada: 0,
  }

  for (const event of events) {
    const status = resolveEventStatus(event, anchor, options)
    counts[status] += 1
  }

  return counts
}

export type AttendanceSummary = {
  rate: number
  realizada: number
  faltou: number
  remarcada: number
  cancelada: number
  evaluated: number
}

export function getAttendanceSummary(
  events: CalendarEvent[],
  month: Date = new Date(),
  anchor: Date = new Date(),
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): AttendanceSummary {
  const monthEvents = pastSessionsInMonth(events, month, anchor)
  const counts = countByStatus(monthEvents, anchor, options)
  const evaluated = counts.realizada + counts.faltou
  const rate = evaluated ? Math.round((counts.realizada / evaluated) * 100) : 0

  return {
    rate,
    realizada: counts.realizada,
    faltou: counts.faltou,
    remarcada: counts.remarcada,
    cancelada: counts.cancelada,
    evaluated,
  }
}

export type ModalityAttendanceRow = {
  modality: PatientModality
  rate: number
  realizada: number
  faltou: number
  total: number
}

export function getAttendanceByModality(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date(),
  anchor: Date = new Date(),
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): ModalityAttendanceRow[] {
  const patientMap = patientByIdMap(patients)
  const monthEvents = pastSessionsInMonth(events, month, anchor)
  const buckets = new Map<
    PatientModality,
    { realizada: number; faltou: number }
  >()

  for (const event of monthEvents) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue

    const status = resolveEventStatus(event, anchor, options)
    if (status !== "realizada" && status !== "faltou") continue

    const bucket = buckets.get(patient.modality) ?? { realizada: 0, faltou: 0 }
    if (status === "realizada") bucket.realizada += 1
    else bucket.faltou += 1
    buckets.set(patient.modality, bucket)
  }

  const order: PatientModality[] = ["presencial", "online", "hibrido"]

  return order
    .filter((modality) => buckets.has(modality))
    .map((modality) => {
      const { realizada, faltou } = buckets.get(modality)!
      const total = realizada + faltou
      return {
        modality,
        rate: total ? Math.round((realizada / total) * 100) : 0,
        realizada,
        faltou,
        total,
      }
    })
}

export function getAttendanceHistory(
  events: CalendarEvent[],
  months = 12,
  anchor: Date = new Date(),
  locale = "pt-BR",
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
) {
  const intl = locale === "en" ? "en-US" : "pt-BR"
  const now = new Date(anchor.getFullYear(), anchor.getMonth(), 1)

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
    const label = date
      .toLocaleDateString(intl, { month: "short" })
      .replace(".", "")
    const summary = getAttendanceSummary(events, date, anchor, options)

    return {
      month: label.charAt(0).toUpperCase() + label.slice(1),
      taxa: summary.rate,
      realizadas: summary.realizada,
      faltas: summary.faltou,
    }
  })
}

export type SessionOutcomeRow = {
  status: SessionStatus
  count: number
  pct: number
}

export function getSessionOutcomeBreakdown(
  events: CalendarEvent[],
  month: Date = new Date(),
  anchor: Date = new Date(),
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): SessionOutcomeRow[] {
  const monthEvents = pastSessionsInMonth(events, month, anchor)
  const counts = countByStatus(monthEvents, anchor, options)
  const relevant: SessionStatus[] = [
    "realizada",
    "faltou",
    "remarcada",
    "cancelada",
  ]
  const total = relevant.reduce((sum, status) => sum + counts[status], 0)

  return relevant
    .map((status) => ({
      status,
      count: counts[status],
      pct: total ? Math.round((counts[status] / total) * 100) : 0,
    }))
    .filter((row) => row.count > 0)
}

export function getReportMonthOptions(count = 12, anchor = new Date(), locale = "pt-BR") {
  const intl = locale === "en" ? "en-US" : "pt-BR"
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      anchor.getFullYear(),
      anchor.getMonth() - index,
      1
    )
    const raw = date.toLocaleDateString(intl, {
      month: "long",
      year: "numeric",
    })

    return {
      value: `${date.getFullYear()}-${date.getMonth()}`,
      label: raw.charAt(0).toUpperCase() + raw.slice(1),
      date,
    }
  })
}

export function parseReportMonth(value: string) {
  const [year, month] = value.split("-").map(Number)
  return new Date(year, month, 1)
}

export { getRevenueByModality }
