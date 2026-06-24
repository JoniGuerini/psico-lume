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

type SessionStatusStyle = {
  label: string
  badge: string
  block: string
  blockMuted: string
}

export const sessionStatusConfig: Record<SessionStatus, SessionStatusStyle> = {
  agendada: {
    label: "Agendada",
    badge:
      "border-[var(--session-agendada-border)] bg-[var(--session-agendada-bg)] text-[var(--session-agendada-fg)]",
    block:
      "border-[var(--session-agendada-border)] bg-[var(--session-agendada-bg)] text-[var(--session-agendada-fg)]",
    blockMuted: "text-[var(--session-agendada-fg-muted)]",
  },
  realizada: {
    label: "Realizada",
    badge:
      "border-[var(--session-realizada-border)] bg-[var(--session-realizada-bg)] text-[var(--session-realizada-fg)]",
    block:
      "border-[var(--session-realizada-border)] bg-[var(--session-realizada-bg)] text-[var(--session-realizada-fg)]",
    blockMuted: "text-[var(--session-realizada-fg-muted)]",
  },
  faltou: {
    label: "Faltou",
    badge:
      "border-[var(--session-faltou-border)] bg-[var(--session-faltou-bg)] text-[var(--session-faltou-fg)]",
    block:
      "border-[var(--session-faltou-border)] bg-[var(--session-faltou-bg)] text-[var(--session-faltou-fg)]",
    blockMuted: "text-[var(--session-faltou-fg-muted)]",
  },
  remarcada: {
    label: "Remarcada",
    badge:
      "border-[var(--session-remarcada-border)] bg-[var(--session-remarcada-bg)] text-[var(--session-remarcada-fg)]",
    block:
      "border-[var(--session-remarcada-border)] bg-[var(--session-remarcada-bg)] text-[var(--session-remarcada-fg)]",
    blockMuted: "text-[var(--session-remarcada-fg-muted)]",
  },
  cancelada: {
    label: "Cancelada",
    badge:
      "border-[var(--session-cancelada-border)] bg-[var(--session-cancelada-bg)] text-[var(--session-cancelada-fg)]",
    block:
      "border-[var(--session-cancelada-border)] bg-[var(--session-cancelada-bg)] text-[var(--session-cancelada-fg)]",
    blockMuted: "text-[var(--session-cancelada-fg-muted)]",
  },
}

export function getEventStatus(event: CalendarEvent): SessionStatus {
  return event.status ?? DEFAULT_SESSION_STATUS
}

export type SessionStatusOptions = {
  /** Demo: infere realizada/faltou em sessões passadas ainda agendadas. Convidado: false. */
  seedPastStatuses?: boolean
}

export const DEMO_SESSION_STATUS_OPTIONS: SessionStatusOptions = {
  seedPastStatuses: true,
}

export const GUEST_SESSION_STATUS_OPTIONS: SessionStatusOptions = {
  seedPastStatuses: false,
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Status efetivo no calendário; no demo, sessões passadas agendadas viram realizada/faltou. */
export function resolveEventStatus(
  event: CalendarEvent,
  anchor = new Date(),
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): SessionStatus {
  const stored = getEventStatus(event)
  if (stored !== DEFAULT_SESSION_STATUS) return stored
  if (!options.seedPastStatuses) return stored
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
  anchor = new Date(),
  options: SessionStatusOptions = DEMO_SESSION_STATUS_OPTIONS
): CalendarEvent[] {
  if (!options.seedPastStatuses) return events

  let changed = false

  const next = events.map((event) => {
    const resolved = resolveEventStatus(event, anchor, options)
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
