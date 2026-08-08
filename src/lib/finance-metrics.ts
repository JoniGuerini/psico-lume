import type { CalendarEvent, Patient, PatientModality } from "@/data/types"
import {
  getPatientRecurrenceSlots,
  getScheduledPatients,
  parsePrice,
} from "@/data/patients"
import { normalizeSessionFrequency } from "@/lib/session-frequency"
import {
  getOverdueSessionRows,
  getSessionAmount,
  isBillableSession,
  isSessionPaid,
  isSessionPaymentOverdue,
  isSessionUnpaid,
} from "@/lib/session-payment"

const WEEKS_PER_MONTH = 4.33

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function patientByIdMap(patients: Patient[]) {
  return new Map(patients.map((patient) => [patient.id, patient]))
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

/** Sessões/mês estimadas a partir da frequência e dos horários recorrentes. */
export function estimateMonthlySessionCount(patient: Patient): number {
  const slots = Math.max(1, getPatientRecurrenceSlots(patient).length)
  const freq = normalizeSessionFrequency(patient.sessionFrequency)

  switch (freq) {
    case "1x-mes":
      return 1
    case "2x-mes":
      return 2
    case "3x-mes":
      return 3
    case "4x-mes":
      return slots * WEEKS_PER_MONTH
  }
}

/** Previsão semanal: preço × sessões/mês ÷ 4.33. */
export function estimateWeeklyRevenue(patients: Patient[]): number {
  return roundMoney(
    getScheduledPatients(patients).reduce((sum, patient) => {
      const price = parsePrice(patient.price)
      return sum + (price * estimateMonthlySessionCount(patient)) / WEEKS_PER_MONTH
    }, 0)
  )
}

export function estimateMonthlyForecastRevenue(patients: Patient[]): number {
  return roundMoney(
    getScheduledPatients(patients).reduce((sum, patient) => {
      return (
        sum + parsePrice(patient.price) * estimateMonthlySessionCount(patient)
      )
    }, 0)
  )
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
    (sum, event) =>
      sum + getSessionAmount(event, patientMap.get(event.patientId)),
    0
  )
}

export function getMonthlyFinanceSummary(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date(),
  today = new Date()
) {
  const billable = getBillableEventsInMonth(events, month)
  const unpaidInMonth = billable.filter(isSessionUnpaid)
  const received = sumSessionAmounts(billable.filter(isSessionPaid), patients)
  const pending = sumSessionAmounts(unpaidInMonth, patients)
  const total = received + pending

  const overdueInMonth = sumSessionAmounts(
    unpaidInMonth.filter((event) => isSessionPaymentOverdue(event, today)),
    patients
  )
  const overdueRows = getOverdueSessionRows(events, patients, today)
  const overdueTotal = overdueRows.reduce((sum, row) => sum + row.amount, 0)

  return {
    total,
    received,
    pending,
    /** Atrasos entre as sessões do mês (escopo alinhado ao pending). */
    overdueInMonth,
    /** Todas as sessões em atraso, de qualquer mês. */
    overdueTotal,
    /** @deprecated use overdueTotal — mantido para compat. */
    overdue: overdueTotal,
    billableCount: billable.length,
    paidCount: billable.filter(isSessionPaid).length,
    unpaidCount: unpaidInMonth.length,
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
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - index),
      1
    )
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
      receita: roundMoney(receita),
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
    const key = event.modality ?? patient.modality
    totals.set(key, (totals.get(key) ?? 0) + getSessionAmount(event, patient))
  }

  return Array.from(totals.entries()).map(([modality, value]) => ({
    modality,
    value: roundMoney(value),
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
  limit = 6,
  month?: Date
) {
  const patientMap = patientByIdMap(patients)
  const totals = new Map<string, { total: number; billableCount: number }>()
  const scoped = month
    ? getBillableEventsInMonth(events, month)
    : events.filter(isBillableSession)

  for (const event of scoped) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue
    const current = totals.get(event.patientId) ?? {
      total: 0,
      billableCount: 0,
    }
    totals.set(event.patientId, {
      total: current.total + getSessionAmount(event, patient),
      billableCount: current.billableCount + 1,
    })
  }

  return Array.from(totals.entries())
    .map(([patientId, stats]) => ({
      patient: patientMap.get(patientId)!,
      total: stats.total,
      billableCount: stats.billableCount,
    }))
    .filter((row) => row.patient)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export type FinanceSessionDetailRow = {
  event: CalendarEvent
  patient: Patient
  amount: number
  paid: boolean
  overdue: boolean
  modality: PatientModality
}

/** Sessões cobráveis do mês — base detalhada da dash financeira. */
export function getFinanceSessionDetailRows(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date(),
  today = new Date()
): FinanceSessionDetailRow[] {
  const patientMap = patientByIdMap(patients)
  const rows: FinanceSessionDetailRow[] = []

  for (const event of getBillableEventsInMonth(events, month)) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue
    rows.push({
      event,
      patient,
      amount: getSessionAmount(event, patient),
      paid: isSessionPaid(event),
      overdue: isSessionPaymentOverdue(event, today),
      modality: (event.modality ?? patient.modality) as PatientModality,
    })
  }

  return rows.sort((a, b) => b.event.date.getTime() - a.event.date.getTime())
}

export type FinancePatientDetailRow = {
  patient: Patient
  billableCount: number
  paidCount: number
  unpaidCount: number
  received: number
  pending: number
  total: number
  overdueCount: number
}

/** Agregado por paciente no mês — para conferência da dash. */
export function getFinancePatientDetailRows(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date(),
  today = new Date()
): FinancePatientDetailRow[] {
  const patientMap = patientByIdMap(patients)
  const totals = new Map<
    string,
    {
      billableCount: number
      paidCount: number
      unpaidCount: number
      received: number
      pending: number
      overdueCount: number
    }
  >()

  for (const event of getBillableEventsInMonth(events, month)) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue
    const current = totals.get(event.patientId) ?? {
      billableCount: 0,
      paidCount: 0,
      unpaidCount: 0,
      received: 0,
      pending: 0,
      overdueCount: 0,
    }
    const amount = getSessionAmount(event, patient)
    const paid = isSessionPaid(event)
    current.billableCount += 1
    if (paid) {
      current.paidCount += 1
      current.received += amount
    } else {
      current.unpaidCount += 1
      current.pending += amount
      if (isSessionPaymentOverdue(event, today)) {
        current.overdueCount += 1
      }
    }
    totals.set(event.patientId, current)
  }

  return Array.from(totals.entries())
    .map(([patientId, stats]) => ({
      patient: patientMap.get(patientId)!,
      billableCount: stats.billableCount,
      paidCount: stats.paidCount,
      unpaidCount: stats.unpaidCount,
      received: roundMoney(stats.received),
      pending: roundMoney(stats.pending),
      total: roundMoney(stats.received + stats.pending),
      overdueCount: stats.overdueCount,
    }))
    .filter((row) => row.patient)
    .sort((a, b) => b.total - a.total)
}

export type FinancePeriodDetailRow = {
  /** Início do dia (local) do período. */
  date: Date
  billableCount: number
  paidCount: number
  unpaidCount: number
  received: number
  pending: number
  total: number
  overdueCount: number
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** Agregado por dia no mês — conferência temporal da dash. */
export function getFinancePeriodDetailRows(
  events: CalendarEvent[],
  patients: Patient[],
  month: Date = new Date(),
  today = new Date()
): FinancePeriodDetailRow[] {
  const patientMap = patientByIdMap(patients)
  const totals = new Map<
    string,
    {
      date: Date
      billableCount: number
      paidCount: number
      unpaidCount: number
      received: number
      pending: number
      overdueCount: number
    }
  >()

  for (const event of getBillableEventsInMonth(events, month)) {
    const patient = patientMap.get(event.patientId)
    if (!patient) continue
    const key = dayKey(event.date)
    const current = totals.get(key) ?? {
      date: new Date(
        event.date.getFullYear(),
        event.date.getMonth(),
        event.date.getDate()
      ),
      billableCount: 0,
      paidCount: 0,
      unpaidCount: 0,
      received: 0,
      pending: 0,
      overdueCount: 0,
    }
    const amount = getSessionAmount(event, patient)
    const paid = isSessionPaid(event)
    current.billableCount += 1
    if (paid) {
      current.paidCount += 1
      current.received += amount
    } else {
      current.unpaidCount += 1
      current.pending += amount
      if (isSessionPaymentOverdue(event, today)) {
        current.overdueCount += 1
      }
    }
    totals.set(key, current)
  }

  return Array.from(totals.values())
    .map((stats) => ({
      date: stats.date,
      billableCount: stats.billableCount,
      paidCount: stats.paidCount,
      unpaidCount: stats.unpaidCount,
      received: roundMoney(stats.received),
      pending: roundMoney(stats.pending),
      total: roundMoney(stats.received + stats.pending),
      overdueCount: stats.overdueCount,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

export { WEEKS_PER_MONTH }
