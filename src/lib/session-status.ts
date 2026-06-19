import type { CalendarEvent, RescheduledFrom, SessionStatus } from "@/data/types"

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
    block: "border-border bg-background/40",
  },
  realizada: {
    label: "Realizada",
    badge: "border-sidebar-primary/30 bg-sidebar-primary/10 text-foreground",
    block: "border-sidebar-primary/40 bg-sidebar-primary/10",
  },
  faltou: {
    label: "Faltou",
    badge: "border-destructive/30 bg-destructive/10 text-destructive",
    block: "border-destructive/40 bg-destructive/10",
  },
  remarcada: {
    label: "Remarcada",
    badge: "border-primary/30 bg-primary/10 text-foreground",
    block: "border-primary/40 bg-primary/10",
  },
  cancelada: {
    label: "Cancelada",
    badge: "border-muted-foreground/30 bg-muted/60 text-muted-foreground",
    block: "border-muted-foreground/40 bg-muted/50",
  },
}

export function getEventStatus(event: CalendarEvent): SessionStatus {
  return event.status ?? DEFAULT_SESSION_STATUS
}

/** Ao arrastar no grid: faltou/cancelada voltam para agendada; agendada vira remarcada. */
export function resolveStatusAfterMove(
  currentStatus: SessionStatus
): SessionStatus {
  if (currentStatus === "faltou" || currentStatus === "cancelada") {
    return "agendada"
  }
  if (currentStatus === "agendada") {
    return "remarcada"
  }
  return currentStatus
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
  if (nextStatus === "remarcada" && currentStatus === "agendada") {
    return captureRescheduledFrom(event)
  }
  if (
    nextStatus === "agendada" &&
    (currentStatus === "faltou" || currentStatus === "cancelada")
  ) {
    return undefined
  }
  return event.rescheduledFrom
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

  return next.map((event) => ({
    ...event,
    status:
      statusById.get(event.id) ??
      statusByKey.get(eventStatusKey(event)) ??
      getEventStatus(event),
    rescheduledFrom: rescheduledById.get(event.id) ?? event.rescheduledFrom,
  }))
}

export function seedPastSessionStatus(
  patientId: string,
  date: Date
): SessionStatus {
  const seed = (patientId.charCodeAt(0) + date.getDate() + date.getMonth()) % 10
  if (seed < 7) return "realizada"
  return "faltou"
}
