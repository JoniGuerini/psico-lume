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
  seedPastSessionStatus,
} from "@/lib/session-status"
import { seedAbsenceWithNotice, seedSessionPaid } from "@/lib/session-payment"
import { shouldIncludeRecurringDate } from "@/lib/session-frequency"

/** Janela da agenda: ~3 meses passados e 12 meses à frente. */
export const CALENDAR_PAST_DAYS = 90
export const CALENDAR_FUTURE_DAYS = 365

function recurringEventId(patientId: string, date: Date, start: string) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `rec-${patientId}-${y}-${m}-${d}-${start}`
}

function buildEventForSlot(
  patient: Patient,
  eventDate: Date,
  start: string,
  duration: number,
  todayStart: Date
): CalendarEvent {
  const end = addMinutes(start, duration)
  const status =
    eventDate < todayStart
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
  }
}

export function buildCalendarEvents(
  patients: Patient[],
  anchor = new Date()
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  const rangeStart = addDays(anchor, -CALENDAR_PAST_DAYS)
  const rangeEnd = addDays(anchor, CALENDAR_FUTURE_DAYS)
  const todayStart = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate()
  )

  for (const patient of patients) {
    const slots = getPatientRecurrenceSlots(patient)
    if (slots.length === 0) continue

    for (const slot of slots) {
      const targetDay = getWeekdayIndex(slot.weekdayCode)

      for (
        let cursor = new Date(rangeStart);
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

        events.push(
          buildEventForSlot(
            patient,
            eventDate,
            slot.start,
            slot.duration,
            todayStart
          )
        )
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
