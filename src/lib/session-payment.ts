import type { CalendarEvent, Patient } from "@/data/types"
import { parsePrice } from "@/data/patients"
import { getEventStatus } from "@/lib/session-status"

export type UnpaidSessionRow = {
  event: CalendarEvent
  patient: Patient
  amount: number
  daysSince: number
  overdue: boolean
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function parseAmountInput(value: string): number {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatAmountInput(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function getSessionAmount(
  event: CalendarEvent,
  patient?: Patient
): number {
  if (event.amount != null && event.amount > 0) {
    return event.amount
  }
  if (patient) {
    return parsePrice(patient.price)
  }
  return 0
}

export function seedSessionPaid(patientId: string, date: Date): boolean {
  const seed =
    (patientId.charCodeAt(1) + date.getDate() * 3 + date.getMonth()) % 5
  return seed !== 0 && seed !== 1
}

export function seedAbsenceWithNotice(patientId: string, date: Date): boolean {
  const seed =
    (patientId.charCodeAt(2) + date.getDate() * 2 + date.getMonth()) % 3
  return seed === 0
}

/** Cobrança: realizada, ou faltou sem aviso prévio. */
export function isBillableSession(event: CalendarEvent): boolean {
  const status = getEventStatus(event)
  if (status === "realizada") return true
  if (status === "faltou") return event.absenceWithNotice !== true
  return false
}

export function isSessionPaid(event: CalendarEvent): boolean {
  return isBillableSession(event) && event.paid === true
}

export function isSessionUnpaid(event: CalendarEvent): boolean {
  return isBillableSession(event) && event.paid !== true
}

export function daysSinceSession(date: Date, today = new Date()): number {
  const diff =
    (startOfDay(today).getTime() - startOfDay(date).getTime()) / 86_400_000
  return Math.max(0, Math.round(diff))
}

/** Em atraso a partir do 1º dia do mês seguinte à sessão. */
export function isSessionPaymentOverdue(
  event: CalendarEvent,
  today = new Date()
): boolean {
  if (!isSessionUnpaid(event)) return false
  const overdueFrom = startOfDay(
    new Date(event.date.getFullYear(), event.date.getMonth() + 1, 1)
  )
  return startOfDay(today) >= overdueFrom
}

export function patientHasOverdueSessions(
  patientId: string,
  events: CalendarEvent[],
  today = new Date()
): boolean {
  return events.some(
    (event) =>
      event.patientId === patientId && isSessionPaymentOverdue(event, today)
  )
}

export function isPatientOverdue(
  patient: Patient,
  events: CalendarEvent[],
  today = new Date()
): boolean {
  if (patient.paymentOverdueManual === true) return true
  if (patient.paymentOverdueManual === false) return false
  return patientHasOverdueSessions(patient.id, events, today)
}

export function resolveEventBilling(
  previous: CalendarEvent,
  patch: Partial<CalendarEvent>,
  patient?: Patient
): Pick<CalendarEvent, "paid" | "amount" | "absenceWithNotice"> {
  const merged = { ...previous, ...patch }
  const nextStatus = getEventStatus(merged)
  const absenceWithNotice =
    nextStatus === "faltou"
      ? (patch.absenceWithNotice ?? previous.absenceWithNotice ?? false)
      : undefined

  const nextEvent: CalendarEvent = {
    ...merged,
    status: nextStatus,
    absenceWithNotice,
  }

  if (!isBillableSession(nextEvent)) {
    return { paid: undefined, amount: undefined, absenceWithNotice }
  }

  const amount =
    patch.amount ?? previous.amount ?? (patient ? parsePrice(patient.price) : 0)

  const wasBillable = isBillableSession({
    ...previous,
    status: getEventStatus(previous),
  })

  const billingChanged =
    !wasBillable ||
    getEventStatus(previous) !== nextStatus ||
    (nextStatus === "faltou" &&
      previous.absenceWithNotice !== absenceWithNotice)

  if (billingChanged) {
    return {
      paid: typeof patch.paid === "boolean" ? patch.paid : false,
      amount,
      absenceWithNotice,
    }
  }

  return {
    paid: patch.paid ?? previous.paid ?? false,
    amount,
    absenceWithNotice,
  }
}

export function buildUnpaidSessionRows(
  events: CalendarEvent[],
  patients: Patient[],
  today = new Date()
): UnpaidSessionRow[] {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))

  return events
    .filter(isSessionUnpaid)
    .map((event) => {
      const patient = patientById.get(event.patientId)
      if (!patient) return null

      const daysSince = daysSinceSession(event.date, today)
      return {
        event,
        patient,
        amount: getSessionAmount(event, patient),
        daysSince,
        overdue: isSessionPaymentOverdue(event, today),
      }
    })
    .filter((row): row is UnpaidSessionRow => row !== null)
    .sort((a, b) => a.event.date.getTime() - b.event.date.getTime())
}

export function getOverdueSessionRows(
  events: CalendarEvent[],
  patients: Patient[],
  today = new Date()
) {
  return buildUnpaidSessionRows(events, patients, today).filter(
    (row) => row.overdue
  )
}
