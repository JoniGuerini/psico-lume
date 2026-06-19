import {
  addDays,
  addMinutes,
  getWeekdayIndex,
  isSameDay,
} from "@/data/patients"
import type { CalendarEvent, Patient } from "@/data/types"
import {
  DEFAULT_SESSION_STATUS,
  seedPastSessionStatus,
} from "@/lib/session-status"

function getIsoWeek(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = copy.getDay() || 7
  copy.setDate(copy.getDate() + 4 - day)
  const yearStart = new Date(copy.getFullYear(), 0, 1)
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

function shouldIncludeBiweekly(patient: Patient, date: Date, anchor: Date) {
  if (!patient.biweekly) return true
  return getIsoWeek(date) % 2 === getIsoWeek(anchor) % 2
}

export function buildCalendarEvents(
  patients: Patient[],
  anchor = new Date()
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  let id = 1

  const rangeStart = addDays(anchor, -14)
  const rangeEnd = addDays(anchor, 35)
  const todayStart = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate()
  )

  for (const patient of patients) {
    if (patient.status !== "ativo" || !patient.sessionTime || !patient.sessionDay) {
      continue
    }

    const targetDay = getWeekdayIndex(patient.sessionDay)

    for (
      let cursor = new Date(rangeStart);
      cursor <= rangeEnd;
      cursor = addDays(cursor, 1)
    ) {
      if (cursor.getDay() !== targetDay) continue
      if (!shouldIncludeBiweekly(patient, cursor, anchor)) continue

      const start = patient.sessionTime
      const end = addMinutes(start, patient.sessionDuration)
      const eventDate = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate()
      )
      const status =
        eventDate < todayStart
          ? seedPastSessionStatus(patient.id, eventDate)
          : DEFAULT_SESSION_STATUS

      events.push({
        id: String(id++),
        patientId: patient.id,
        title: patient.name,
        date: eventDate,
        start,
        end,
        status,
      })
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

export function countEventsByDay(events: CalendarEvent[], date: Date) {
  return eventsOfDay(events, date).length
}
