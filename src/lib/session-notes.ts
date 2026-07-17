import type { CalendarEvent, SessionNote } from "@/data/types"
import { formatLocaleDate } from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"

export function isLinkedSessionNote(
  note: Pick<SessionNote, "eventId">
): boolean {
  return Boolean(note.eventId)
}

export function formatEventNoteDate(
  event: Pick<CalendarEvent, "date">,
  locale: Locale
) {
  return formatLocaleDate(event.date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function compareEventsChronological(a: CalendarEvent, b: CalendarEvent) {
  const dayDiff = a.date.getTime() - b.date.getTime()
  if (dayDiff !== 0) return dayDiff
  return a.start.localeCompare(b.start)
}

/** Sessões do paciente em ordem cronológica (mais antigas primeiro). */
export function getPatientEventsChronological(
  events: CalendarEvent[],
  patientId: string
) {
  return events
    .filter((event) => event.patientId === patientId)
    .sort(compareEventsChronological)
}

/** Nº da sessão = posição na cronologia do paciente (1-based). */
export function getSessionOrdinalForEvent(
  events: CalendarEvent[],
  patientId: string,
  eventId: string
): number | undefined {
  const ordered = getPatientEventsChronological(events, patientId)
  const index = ordered.findIndex((event) => event.id === eventId)
  return index >= 0 ? index + 1 : undefined
}

export function noteMatchesEvent(
  note: SessionNote,
  event: CalendarEvent,
  locale: Locale
) {
  if (note.patientId !== event.patientId) return false
  if (note.eventId) return note.eventId === event.id
  return note.date === formatEventNoteDate(event, locale)
}

export function findNoteForEvent(
  notes: SessionNote[],
  event: CalendarEvent,
  locale: Locale
) {
  return notes.find((note) => noteMatchesEvent(note, event, locale))
}

export function isEventClaimedByNote(
  notes: SessionNote[],
  eventId: string,
  exceptNoteId?: string
) {
  return notes.some(
    (note) =>
      note.eventId === eventId &&
      (!exceptNoteId || note.id !== exceptNoteId)
  )
}

/** Sessões disponíveis para vincular (sem nota, ou a da nota em edição). */
export function getLinkableSessionsForPatient(
  events: CalendarEvent[],
  notes: SessionNote[],
  patientId: string,
  options?: { exceptNoteId?: string }
) {
  const claimed = new Set(
    notes
      .filter(
        (note) =>
          note.eventId &&
          (!options?.exceptNoteId || note.id !== options.exceptNoteId)
      )
      .map((note) => note.eventId as string)
  )

  return getPatientEventsChronological(events, patientId)
    .filter((event) => !claimed.has(event.id))
    .sort((a, b) => {
      const dayDiff = b.date.getTime() - a.date.getTime()
      if (dayDiff !== 0) return dayDiff
      return b.start.localeCompare(a.start)
    })
}

/**
 * Liga notas legadas (sem eventId) a uma sessão quando há exatamente
 * um evento do paciente naquela data e o evento ainda não tem nota.
 */
export function linkNotesToUniquePatientDayEvents(
  notes: SessionNote[],
  events: CalendarEvent[],
  locale: Locale
): SessionNote[] {
  const claimedEventIds = new Set(
    notes.map((note) => note.eventId).filter(Boolean) as string[]
  )

  return notes.map((note) => {
    if (note.eventId) {
      const ordinal = getSessionOrdinalForEvent(
        events,
        note.patientId,
        note.eventId
      )
      return ordinal != null ? { ...note, sessionNumber: ordinal } : note
    }

    const sameDay = events.filter(
      (event) =>
        event.patientId === note.patientId &&
        formatEventNoteDate(event, locale) === note.date &&
        !claimedEventIds.has(event.id)
    )

    if (sameDay.length !== 1) return note

    const event = sameDay[0]
    claimedEventIds.add(event.id)
    const ordinal = getSessionOrdinalForEvent(events, note.patientId, event.id)

    return {
      ...note,
      eventId: event.id,
      sessionNumber: ordinal,
      date: formatEventNoteDate(event, locale),
    }
  })
}

export function unlinkNotesFromDeletedEvent(
  notes: SessionNote[],
  eventId: string
): SessionNote[] {
  return notes.map((note) => {
    if (note.eventId !== eventId) return note
    return {
      id: note.id,
      patientId: note.patientId,
      date: note.date,
      summary: note.summary,
      evolution: note.evolution,
      plan: note.plan,
      tags: note.tags,
      mood: note.mood,
      modality: note.modality,
    }
  })
}
