import {
  addDays,
  addMinutes,
  getPatientRecurrenceSlots,
  getWeekdayIndex,
  isSameDay,
  parsePrice,
} from "@/data/patients"
import type { CalendarEvent, Patient } from "@/data/types"
import {
  DEFAULT_SESSION_STATUS,
  DEMO_SESSION_STATUS_OPTIONS,
  seedPastSessionStatus,
  type SessionStatusOptions,
} from "@/lib/session-status"
import { seedAbsenceWithNotice, seedSessionPaid } from "@/lib/session-payment"
import { shouldIncludeRecurringDate } from "@/lib/session-frequency"

/** Janela da agenda: ~3 meses passados e 12 meses à frente. */
export const CALENDAR_PAST_DAYS = 90
export const CALENDAR_FUTURE_DAYS = 365

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseIsoDateLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function parseBrDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
}

const sinceMonthMap: Record<string, number> = {
  Jan: 0,
  Fev: 1,
  Mar: 2,
  Abr: 3,
  Mai: 4,
  Jun: 5,
  Jul: 6,
  Ago: 7,
  Set: 8,
  Out: 9,
  Nov: 10,
  Dez: 11,
}

function parseSinceMonthStart(since: string): Date | null {
  if (since === "—" || !since.trim()) return null
  const [month, year] = since.split(" ")
  const monthIndex = sinceMonthMap[month]
  const parsedYear = Number(year)
  if (monthIndex === undefined || Number.isNaN(parsedYear)) return null
  return new Date(parsedYear, monthIndex, 1)
}

/** Primeira data em que sessões recorrentes devem existir para o paciente. */
export function getPatientRecurrenceStart(patient: Patient, anchor = new Date()) {
  const todayStart = startOfDay(anchor)

  if (patient.recurrenceFrom) {
    const parsed = parseIsoDateLocal(patient.recurrenceFrom)
    if (parsed) return startOfDay(parsed)
  }

  if (patient.therapyStart) {
    const parsed = parseBrDate(patient.therapyStart)
    if (parsed) return startOfDay(parsed)
  }

  const sinceStart = parseSinceMonthStart(patient.since)
  if (sinceStart) {
    if (
      sinceStart.getFullYear() === todayStart.getFullYear() &&
      sinceStart.getMonth() === todayStart.getMonth()
    ) {
      return todayStart
    }
    return sinceStart
  }

  return todayStart
}

const RECURRING_EVENT_ID_PREFIX = "rec-"

function recurringEventId(patientId: string, date: Date, start: string) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${RECURRING_EVENT_ID_PREFIX}${patientId}-${y}-${m}-${d}-${start}`
}

/** Eventos gerados pela recorrência do paciente; os demais foram criados manualmente. */
export function isRecurringEventId(id: string) {
  return id.startsWith(RECURRING_EVENT_ID_PREFIX)
}

function buildEventForSlot(
  patient: Patient,
  eventDate: Date,
  start: string,
  duration: number,
  todayStart: Date,
  modality?: "presencial" | "online",
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): CalendarEvent {
  const end = addMinutes(start, duration)
  const status =
    options.seedPastStatuses && eventDate < todayStart
      ? seedPastSessionStatus(patient.id, eventDate)
      : DEFAULT_SESSION_STATUS

  const absenceWithNotice =
    status === "faltou"
      ? seedAbsenceWithNotice(patient.id, eventDate)
      : undefined
  const billable =
    status === "realizada" ||
    (status === "faltou" && absenceWithNotice !== true)

  return {
    id: recurringEventId(patient.id, eventDate, start),
    patientId: patient.id,
    title: patient.name,
    date: eventDate,
    start,
    end,
    status,
    amount: billable ? parsePrice(patient.price) : undefined,
    absenceWithNotice,
    paid: billable ? seedSessionPaid(patient.id, eventDate) : undefined,
    modality,
  }
}

export function buildCalendarEvents(
  patients: Patient[],
  anchor = new Date(),
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const seenIds = new Set<string>()

  const rangeStart = addDays(anchor, -CALENDAR_PAST_DAYS)
  const rangeEnd = addDays(anchor, CALENDAR_FUTURE_DAYS)
  const todayStart = startOfDay(anchor)

  for (const patient of patients) {
    const slots = getPatientRecurrenceSlots(patient)
    if (slots.length === 0) continue

    const patientStart = getPatientRecurrenceStart(patient, anchor)
    const effectiveStart =
      patientStart.getTime() > rangeStart.getTime() ? patientStart : rangeStart

    for (const slot of slots) {
      const targetDay = getWeekdayIndex(slot.weekdayCode)

      for (
        let cursor = new Date(effectiveStart);
        cursor <= rangeEnd;
        cursor = addDays(cursor, 1)
      ) {
        if (cursor.getDay() !== targetDay) continue
        if (
          !shouldIncludeRecurringDate(
            patient.sessionFrequency,
            cursor,
            anchor
          )
        ) {
          continue
        }

        const eventDate = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate()
        )

        const event = buildEventForSlot(
          patient,
          eventDate,
          slot.start,
          slot.duration,
          todayStart,
          slot.modality,
          options
        )

        if (seenIds.has(event.id)) continue
        seenIds.add(event.id)
        events.push(event)
      }
    }
  }

  return events.sort((a, b) => {
    const dayDiff = a.date.getTime() - b.date.getTime()
    if (dayDiff !== 0) return dayDiff
    return a.start.localeCompare(b.start)
  })
}

export function eventsOfDay(events: CalendarEvent[], date: Date) {
  return events
    .filter((event) => isSameDay(event.date, date))
    .sort((a, b) => a.start.localeCompare(b.start))
}

/** Histórico no perfil: todo o passado + futuro só até o fim do mês atual. */
export function getEventsForPatientProfile(
  events: CalendarEvent[],
  patientId: string,
  anchor = new Date()
) {
  const endOfCurrentMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0
  )
  endOfCurrentMonth.setHours(23, 59, 59, 999)

  return getEventsForPatient(events, patientId).filter((event) => {
    const eventDay = new Date(
      event.date.getFullYear(),
      event.date.getMonth(),
      event.date.getDate()
    )
    return eventDay <= endOfCurrentMonth
  })
}

export function getEventsForPatient(
  events: CalendarEvent[],
  patientId: string
) {
  return events
    .filter((event) => event.patientId === patientId)
    .sort((a, b) => {
      const dayDiff = b.date.getTime() - a.date.getTime()
      if (dayDiff !== 0) return dayDiff
      return b.start.localeCompare(a.start)
    })
}

export function countEventsByDay(events: CalendarEvent[], date: Date) {
  return eventsOfDay(events, date).length
}
