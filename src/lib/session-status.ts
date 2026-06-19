import type { CalendarEvent, Patient, RescheduledFrom, SessionStatus } from "@/data/types"
import {
  isBillableSession,
  resolveEventBilling,
  seedAbsenceWithNotice,
} from "@/lib/session-payment"

export const DEFAULT_SESSION_STATUS: SessionStatus = "agendada"

export const sessionStatusOptions: SessionStatus[] = [
  "agendada",
  "realizada",
  "faltou",
  "remarcada",
  "cancelada",
]

export const sessionStatusConfig: Record<
  SessionStatus,
  { label: string; badge: string; block: string }
> = {
  agendada: {
    label: "Agendada",
    badge: "border-border bg-background/40 text-foreground",
    block:
      "border-border bg-[color-mix(in_oklch,var(--background)_40%,var(--card))]",
  },
  realizada: {
    label: "Realizada",
    badge: "border-sidebar-primary/30 bg-sidebar-primary/10 text-foreground",
    block:
      "border-sidebar-primary/40 bg-[color-mix(in_oklch,var(--sidebar-primary)_10%,var(--card))]",
  },
  faltou: {
    label: "Faltou",
    badge: "border-destructive/30 bg-destructive/10 text-destructive",
    block:
      "border-destructive/40 bg-[color-mix(in_oklch,var(--destructive)_10%,var(--card))]",
  },
  remarcada: {
    label: "Remarcada",
    badge: "border-primary/30 bg-primary/10 text-foreground",
    block:
      "border-primary/40 bg-[color-mix(in_oklch,var(--primary)_10%,var(--card))]",
  },
  cancelada: {
    label: "Cancelada",
    badge: "border-muted-foreground/30 bg-muted/60 text-muted-foreground",
    block:
      "border-muted-foreground/40 bg-[color-mix(in_oklch,var(--muted)_50%,var(--card))]",
  },
}

export function getEventStatus(event: CalendarEvent): SessionStatus {
  return event.status ?? DEFAULT_SESSION_STATUS
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Status efetivo no calendário: sessões passadas não ficam presas em agendada. */
export function resolveEventStatus(
  event: CalendarEvent,
  anchor = new Date()
): SessionStatus {
  const stored = getEventStatus(event)
  if (stored !== DEFAULT_SESSION_STATUS) return stored
  if (startOfDay(event.date) >= startOfDay(anchor)) return stored
  return seedPastSessionStatus(event.patientId, event.date)
}

function resolveMergedStatus(
  stored: SessionStatus | undefined,
  incoming: SessionStatus
): SessionStatus {
  if (!stored) return incoming
  if (stored !== DEFAULT_SESSION_STATUS) return stored
  if (incoming !== DEFAULT_SESSION_STATUS) return incoming
  return stored
}

export function syncStaleEventStatuses(
  events: CalendarEvent[],
  patients: Patient[],
  anchor = new Date()
): CalendarEvent[] {
  let changed = false

  const next = events.map((event) => {
    const resolved = resolveEventStatus(event, anchor)
    if (resolved === getEventStatus(event)) return event

    changed = true
    const patient = patients.find((item) => item.id === event.patientId)
    const absenceWithNotice =
      resolved === "faltou"
        ? seedAbsenceWithNotice(event.patientId, event.date)
        : undefined
    const billing = resolveEventBilling(
      event,
      { status: resolved, absenceWithNotice },
      patient
    )

    return {
      ...event,
      status: resolved,
      ...billing,
    }
  })

  return changed ? next : events
}

/** Ao arrastar no grid: qualquer status vira remarcada, exceto realizada. */
export function resolveStatusAfterMove(
  currentStatus: SessionStatus
): SessionStatus {
  if (currentStatus === "realizada") {
    return currentStatus
  }
  return "remarcada"
}

export function captureRescheduledFrom(event: CalendarEvent): RescheduledFrom {
  return {
    date: new Date(
      event.date.getFullYear(),
      event.date.getMonth(),
      event.date.getDate()
    ),
    start: event.start,
    end: event.end,
  }
}

export function resolveRescheduledFromAfterMove(
  event: CalendarEvent,
  currentStatus: SessionStatus,
  nextStatus: SessionStatus
): RescheduledFrom | undefined {
  if (nextStatus !== "remarcada" || currentStatus === "realizada") {
    return event.rescheduledFrom
  }
  if (event.rescheduledFrom) {
    return event.rescheduledFrom
  }
  return captureRescheduledFrom(event)
}

export function formatRescheduledFromLabel(from: RescheduledFrom) {
  const raw = from.date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
  const dateLabel = raw.charAt(0).toUpperCase() + raw.slice(1)
  return `${dateLabel} · ${from.start} – ${from.end}`
}

export function eventStatusKey(event: CalendarEvent) {
  return `${event.patientId}|${event.date.toISOString()}|${event.start}`
}

export function mergeEventStatuses(
  previous: CalendarEvent[],
  next: CalendarEvent[]
): CalendarEvent[] {
  const statusByKey = new Map(
    previous.map((event) => [eventStatusKey(event), getEventStatus(event)])
  )
  const statusById = new Map(
    previous.map((event) => [event.id, getEventStatus(event)])
  )
  const rescheduledById = new Map(
    previous.map((event) => [event.id, event.rescheduledFrom])
  )
  const paidById = new Map(
    previous.map((event) => [event.id, event.paid])
  )
  const paidByKey = new Map(
    previous.map((event) => [eventStatusKey(event), event.paid])
  )
  const amountById = new Map(
    previous.map((event) => [event.id, event.amount])
  )
  const amountByKey = new Map(
    previous.map((event) => [eventStatusKey(event), event.amount])
  )
  const absenceById = new Map(
    previous.map((event) => [event.id, event.absenceWithNotice])
  )
  const absenceByKey = new Map(
    previous.map((event) => [eventStatusKey(event), event.absenceWithNotice])
  )

  return next.map((event) => {
    const incomingStatus = getEventStatus(event)
    const storedStatus =
      statusById.get(event.id) ??
      statusByKey.get(eventStatusKey(event))
    const status = resolveMergedStatus(storedStatus, incomingStatus)
    const paid =
      paidById.get(event.id) ??
      paidByKey.get(eventStatusKey(event)) ??
      event.paid
    const amount =
      amountById.get(event.id) ??
      amountByKey.get(eventStatusKey(event)) ??
      event.amount
    const absenceWithNotice =
      absenceById.get(event.id) ??
      absenceByKey.get(eventStatusKey(event)) ??
      event.absenceWithNotice

    const merged = {
      ...event,
      status,
      amount,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
      paid: isBillableSession({ ...event, status, absenceWithNotice })
        ? paid
        : undefined,
      rescheduledFrom: rescheduledById.get(event.id) ?? event.rescheduledFrom,
    }

    return merged
  })
}

export function seedPastSessionStatus(
  patientId: string,
  date: Date
): SessionStatus {
  const seed = (patientId.charCodeAt(0) + date.getDate() + date.getMonth()) % 10
  if (seed < 7) return "realizada"
  return "faltou"
}
