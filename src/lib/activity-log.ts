import type { SessionStatus } from "@/data/types"
import { intlLocale, type Locale } from "@/lib/locale"

export const ACTIVITY_LOG_CAP = 300

export type ActivityCategory = "patient" | "session" | "record" | "payment"

export type ActivityAction =
  | "patient.created"
  | "patient.updated"
  | "patient.deleted"
  | "session.created"
  | "session.updated"
  | "session.rescheduled"
  | "session.status_changed"
  | "session.deleted"
  | "record.created"
  | "record.updated"
  | "record.deleted"
  | "payment.marked_paid"
  | "payment.marked_unpaid"
  | "payment.marked_paid_batch"
  | "payment.overdue_manual_on"
  | "payment.overdue_manual_off"
  | "payment.overdue_manual_auto"

export type ActivityEntry = {
  id: string
  at: string
  action: ActivityAction
  category: ActivityCategory
  summaryKey: string
  params: Record<string, string | number>
  patientId?: string
  eventId?: string
  eventDateTimestamp?: number
  noteId?: string
}

export type ActivityDraft = Omit<ActivityEntry, "id" | "at" | "summaryKey"> & {
  summaryKey?: string
  at?: string
}

const ACTION_SUMMARY_KEYS: Record<ActivityAction, string> = {
  "patient.created": "activity.summaries.patientCreated",
  "patient.updated": "activity.summaries.patientUpdated",
  "patient.deleted": "activity.summaries.patientDeleted",
  "session.created": "activity.summaries.sessionCreated",
  "session.updated": "activity.summaries.sessionUpdated",
  "session.rescheduled": "activity.summaries.sessionRescheduled",
  "session.status_changed": "activity.summaries.sessionStatusChanged",
  "session.deleted": "activity.summaries.sessionDeleted",
  "record.created": "activity.summaries.recordCreated",
  "record.updated": "activity.summaries.recordUpdated",
  "record.deleted": "activity.summaries.recordDeleted",
  "payment.marked_paid": "activity.summaries.paymentMarkedPaid",
  "payment.marked_unpaid": "activity.summaries.paymentMarkedUnpaid",
  "payment.marked_paid_batch": "activity.summaries.paymentMarkedPaidBatch",
  "payment.overdue_manual_on": "activity.summaries.paymentOverdueManualOn",
  "payment.overdue_manual_off": "activity.summaries.paymentOverdueManualOff",
  "payment.overdue_manual_auto": "activity.summaries.paymentOverdueManualAuto",
}

const VALID_ACTIONS = new Set<string>(Object.keys(ACTION_SUMMARY_KEYS))
const VALID_CATEGORIES = new Set<ActivityCategory>([
  "patient",
  "session",
  "record",
  "payment",
])

export function activitySummaryKey(action: ActivityAction): string {
  return ACTION_SUMMARY_KEYS[action]
}

export function createActivityEntry(draft: ActivityDraft): ActivityEntry {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: draft.at ?? new Date().toISOString(),
    action: draft.action,
    category: draft.category,
    summaryKey: draft.summaryKey ?? activitySummaryKey(draft.action),
    params: draft.params,
    patientId: draft.patientId,
    eventId: draft.eventId,
    eventDateTimestamp: draft.eventDateTimestamp,
    noteId: draft.noteId,
  }
}

export function prependActivity(
  current: ActivityEntry[],
  entry: ActivityEntry
): ActivityEntry[] {
  return [entry, ...current].slice(0, ACTIVITY_LOG_CAP)
}

export function prependActivityMany(
  current: ActivityEntry[],
  entries: ActivityEntry[]
): ActivityEntry[] {
  if (entries.length === 0) return current
  return [...entries, ...current].slice(0, ACTIVITY_LOG_CAP)
}

export function formatActivityDate(
  date: Date,
  locale: Locale
): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatActivityTime(time: string): string {
  return time.slice(0, 5)
}

export function formatActivityDateTime(
  date: Date,
  start: string,
  locale: Locale
): string {
  return `${formatActivityDate(date, locale)} ${formatActivityTime(start)}`
}

export function isActivityAction(value: string): value is ActivityAction {
  return VALID_ACTIONS.has(value)
}

export function isActivityCategory(value: string): value is ActivityCategory {
  return VALID_CATEGORIES.has(value as ActivityCategory)
}

export function sanitizeActivityEntry(
  raw: unknown,
  index: number
): ActivityEntry | string {
  if (!raw || typeof raw !== "object") {
    return `activity[${index}] inválido`
  }
  const item = raw as Record<string, unknown>
  if (typeof item.id !== "string" || !item.id.trim()) {
    return `activity[${index}].id inválido`
  }
  if (typeof item.at !== "string" || Number.isNaN(Date.parse(item.at))) {
    return `activity[${index}].at inválido`
  }
  if (typeof item.action !== "string" || !isActivityAction(item.action)) {
    return `activity[${index}].action inválido`
  }
  if (typeof item.category !== "string" || !isActivityCategory(item.category)) {
    return `activity[${index}].category inválido`
  }
  if (typeof item.summaryKey !== "string" || !item.summaryKey.trim()) {
    return `activity[${index}].summaryKey inválido`
  }
  if (!item.params || typeof item.params !== "object" || Array.isArray(item.params)) {
    return `activity[${index}].params inválido`
  }

  const params: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(item.params as Record<string, unknown>)) {
    if (typeof value === "string" || typeof value === "number") {
      params[key] = value
    }
  }

  const entry: ActivityEntry = {
    id: item.id.trim(),
    at: item.at,
    action: item.action,
    category: item.category,
    summaryKey: item.summaryKey.trim(),
    params,
  }

  if (typeof item.patientId === "string" && item.patientId) {
    entry.patientId = item.patientId
  }
  if (typeof item.eventId === "string" && item.eventId) {
    entry.eventId = item.eventId
  }
  if (typeof item.noteId === "string" && item.noteId) {
    entry.noteId = item.noteId
  }
  if (
    typeof item.eventDateTimestamp === "number" &&
    Number.isFinite(item.eventDateTimestamp)
  ) {
    entry.eventDateTimestamp = item.eventDateTimestamp
  }

  return entry
}

export function mergeActivityLogs(
  current: ActivityEntry[],
  incoming: ActivityEntry[],
  overwriteConflicts: boolean
): ActivityEntry[] {
  const byId = new Map(current.map((item) => [item.id, item]))
  for (const entry of incoming) {
    if (!byId.has(entry.id) || overwriteConflicts) {
      byId.set(entry.id, entry)
    }
  }
  return Array.from(byId.values())
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, ACTIVITY_LOG_CAP)
}

export function classifySessionUpdate(input: {
  previousDate: Date
  previousStart: string
  previousEnd: string
  previousStatus: SessionStatus | undefined
  nextDate: Date
  nextStart: string
  nextEnd: string
  nextStatus: SessionStatus | undefined
}): "session.rescheduled" | "session.status_changed" | "session.updated" {
  const dateChanged =
    input.previousDate.getTime() !== input.nextDate.getTime() ||
    input.previousStart !== input.nextStart ||
    input.previousEnd !== input.nextEnd
  if (dateChanged) return "session.rescheduled"

  const prevStatus = input.previousStatus ?? "agendada"
  const nextStatus = input.nextStatus ?? "agendada"
  if (prevStatus !== nextStatus) return "session.status_changed"

  return "session.updated"
}

export function activityNavigatesToSession(entry: ActivityEntry): boolean {
  return (
    entry.category === "session" ||
    entry.category === "payment"
  ) && entry.eventDateTimestamp != null
}

export function activityNavigatesToPatient(entry: ActivityEntry): boolean {
  return Boolean(entry.patientId)
}
