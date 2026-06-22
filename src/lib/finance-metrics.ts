import type { CalendarEvent, Patient } from "@/data/types"
import {
  getOverdueSessionRows,
  getSessionAmount,
  isBillableSession,
  isSessionPaid,
  isSessionUnpaid,
} from "@/lib/session-payment"

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function patientByIdMap(patients: Patient[]) {
  return new Map(patients.map((patient) => [patient.id, patient]))
}

export function getBillableEventsInMonth(
  events: CalendarEvent[],
  month: Date = new Date()
) {
  return events.filter(
    (event) => isBillableSession(event) && isSameMonth(event.date, month)
  )
}

export function sumSessionAmounts(
  sessionEvents: CalendarEvent[],
  patients: Patient[]
) {
  const patientMap = patientByIdMap(patients)
  return sessionEvents.reduce(
    (sum, event) => sum + getSessionAmount(event, patientMap.get(event.patientId)),
    0
  )
}

export function getMonthlyFinanceSummary(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date()
) {
  const billable = getBillableEventsInMonth(events, month)
  const received = sumSessionAmounts(
    billable.filter(isSessionPaid),
    patients
  )
  const pending = sumSessionAmounts(
    billable.filter(isSessionUnpaid),
    patients
  )
  const total = received + pending
  const overdueRows = getOverdueSessionRows(events, patients)
  const overdue = overdueRows.reduce((sum, row) => sum + row.amount, 0)

  return {
    total,
    received,
    pending,
    overdue,
    billableCount: billable.length,
    paidCount: billable.filter(isSessionPaid).length,
    unpaidCount: billable.filter(isSessionUnpaid).length,
  }
}

export function getMonthlyRevenueHistory(
  events: CalendarEvent[],
  patients: Patient[],
  months = 12,
  locale = "pt-BR"
) {
  const intl = locale === "en" ? "en-US" : "pt-BR"
  const now = new Date()
  const patientMap = patientByIdMap(patients)

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
    const label = date
      .toLocaleDateString(intl, { month: "short" })
      .replace(".", "")
    const monthEvents = events.filter(
      (event) => isBillableSession(event) && isSameMonth(event.date, date)
    )
    const receita = monthEvents.reduce(
      (sum, event) =>
        sum + getSessionAmount(event, patientMap.get(event.patientId)),
      0
    )

    return {
      month: label.charAt(0).toUpperCase() + label.slice(1),
      receita: Math.round(receita),
    }
  })
}

export function getRevenueByModality(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date()
) {
  const patientMap = patientByIdMap(patients)
  const totals = new Map<string, number>()

  for (const event of getBillableEventsInMonth(events, month)) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue
    const key = patient.modality
    totals.set(key, (totals.get(key) ?? 0) + getSessionAmount(event, patient))
  }

  return Array.from(totals.entries()).map(([modality, value]) => ({
    modality,
    value: Math.round(value),
  }))
}

export function getPatientBillableSummary(
  patientId: string,
  events: CalendarEvent[],
  patient: Patient
) {
  const billable = events.filter(
    (event) => event.patientId === patientId && isBillableSession(event)
  )
  const paid = billable.filter(isSessionPaid)
  const unpaid = billable.filter(isSessionUnpaid)

  return {
    paidTotal: sumSessionAmounts(paid, [patient]),
    unpaidTotal: sumSessionAmounts(unpaid, [patient]),
    unpaidSessions: unpaid.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    ),
  }
}

export function getTopPatientsByRevenue(
  events: CalendarEvent[],
  patients: Patient[],
  limit = 6
) {
  const patientMap = patientByIdMap(patients)
  const totals = new Map<string, number>()

  for (const event of events.filter(isBillableSession)) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue
    totals.set(
      event.patientId,
      (totals.get(event.patientId) ?? 0) + getSessionAmount(event, patient)
    )
  }

  return Array.from(totals.entries())
    .map(([patientId, total]) => ({
      patient: patientMap.get(patientId)!,
      total,
    }))
    .filter((row) => row.patient)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}
