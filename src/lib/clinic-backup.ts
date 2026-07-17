import type {
  CalendarEvent,
  Notification,
  NotificationCategory,
  Patient,
  PatientModality,
  PatientStatus,
  SessionFrequency,
  SessionNote,
  SessionStatus,
} from "@/data/types"
import { APP_VERSION } from "@/lib/app-version"
import {
  createWelcomeNotification,
  type GuestClinicSnapshot,
} from "@/lib/guest-clinic-storage"
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_KEYS,
  persistNotificationPreferences,
  readStoredNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notification-preferences"
import {
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  isDensityId,
  isThemeId,
  persistDensity,
  persistTheme,
  readStoredDensity,
  readStoredTheme,
  type DensityId,
  type ThemeId,
} from "@/lib/theme"
import {
  DEFAULT_LOCALE,
  isLocale,
  persistLocale,
  readStoredLocale,
  type Locale,
} from "@/lib/locale"
import {
  DEFAULT_TOAST_POSITION,
  isToastPosition,
  persistToastPosition,
  readStoredToastPosition,
  type ToastPosition,
} from "@/lib/toast-preferences"
import { persistGuestProfileName, readGuestProfileName } from "@/lib/guest-clinic-storage"
import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Mail,
  UserRound,
  type LucideIcon,
} from "lucide-react"

export const BACKUP_KIND = "psico-lume-local-backup" as const
export const BACKUP_SCHEMA_VERSION = 1

const TIME_RE = /^\d{2}:\d{2}$/
const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

const PATIENT_STATUSES = new Set<PatientStatus>([
  "ativo",
  "em-pausa",
  "lista-espera",
  "alta",
])
const PATIENT_MODALITIES = new Set<PatientModality>([
  "presencial",
  "online",
  "hibrido",
])
const SESSION_FREQUENCIES = new Set<SessionFrequency>([
  "1x-mes",
  "2x-mes",
  "3x-mes",
  "4x-mes",
])
const SESSION_STATUSES = new Set<SessionStatus>([
  "agendada",
  "realizada",
  "faltou",
  "remarcada",
  "cancelada",
])
const NOTIFICATION_CATEGORIES = new Set<NotificationCategory>([
  "sessao",
  "paciente",
  "mensagem",
  "financeiro",
  "sistema",
])
const EVENT_MODALITIES = new Set(["presencial", "online"])

const notificationIcons: Record<NotificationCategory, LucideIcon> = {
  sessao: CalendarClock,
  paciente: UserRound,
  mensagem: Mail,
  financeiro: CreditCard,
  sistema: ClipboardList,
}

type StoredRescheduledFrom = {
  date: string
  start: string
  end: string
}

type StoredCalendarEvent = {
  id: string
  patientId: string
  title: string
  date: string
  start: string
  end: string
  status?: SessionStatus
  amount?: number
  paid?: boolean
  absenceWithNotice?: boolean
  rescheduledFrom?: StoredRescheduledFrom
  modality?: "presencial" | "online"
}

type StoredNotification = {
  id: string
  category: NotificationCategory
  title: string
  description: string
  date: string
  read: boolean
}

export type ClinicBackupPreferences = {
  notifications: NotificationPreferences
  theme: ThemeId
  density: DensityId
  locale: Locale
  toastPosition: ToastPosition
}

export type ClinicBackupFile = {
  kind: typeof BACKUP_KIND
  schemaVersion: number
  appVersion: string
  exportedAt: string
  /** Aviso legível ao abrir o arquivo; ignorado na validação/restauração. */
  notice: string
  profile: { name: string }
  clinic: {
    patients: Patient[]
    events: StoredCalendarEvent[]
    sessionNotes: SessionNote[]
    notifications: StoredNotification[]
  }
  preferences: ClinicBackupPreferences
}

export type ValidatedClinicBackup = {
  profileName: string
  clinic: GuestClinicSnapshot
  preferences: ClinicBackupPreferences
  exportedAt: string
  appVersion: string
  schemaVersion: number
}

export type BackupParseResult =
  | { ok: true; backup: ValidatedClinicBackup }
  | { ok: false; error: string }

export type MergeConflictSummary = {
  patients: number
  events: number
  sessionNotes: number
  total: number
}

export type RestoreMode = "replace" | "merge"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isValidIsoDate(value: string) {
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString() === new Date(date).toISOString()
}

function isLooseIsoDate(value: string) {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

function isValidTime(value: unknown): value is string {
  if (typeof value !== "string" || !TIME_RE.test(value)) return false
  const [hours, minutes] = value.split(":").map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

function serializeEvent(event: CalendarEvent): StoredCalendarEvent {
  return {
    id: event.id,
    patientId: event.patientId,
    title: event.title,
    date: event.date.toISOString(),
    start: event.start,
    end: event.end,
    status: event.status,
    amount: event.amount,
    paid: event.paid,
    absenceWithNotice: event.absenceWithNotice,
    modality: event.modality,
    rescheduledFrom: event.rescheduledFrom
      ? {
          date: event.rescheduledFrom.date.toISOString(),
          start: event.rescheduledFrom.start,
          end: event.rescheduledFrom.end,
        }
      : undefined,
  }
}

function serializeNotification(notification: Notification): StoredNotification {
  return {
    id: notification.id,
    category: notification.category,
    title: notification.title,
    description: notification.description,
    date: notification.date.toISOString(),
    read: notification.read,
  }
}

function deserializeEvent(event: StoredCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    patientId: event.patientId,
    title: event.title,
    date: new Date(event.date),
    start: event.start,
    end: event.end,
    status: event.status,
    amount: event.amount,
    paid: event.paid,
    absenceWithNotice: event.absenceWithNotice,
    modality: event.modality,
    rescheduledFrom: event.rescheduledFrom
      ? {
          date: new Date(event.rescheduledFrom.date),
          start: event.rescheduledFrom.start,
          end: event.rescheduledFrom.end,
        }
      : undefined,
  }
}

function deserializeNotification(notification: StoredNotification): Notification {
  return {
    id: notification.id,
    category: notification.category,
    title: notification.title,
    description: notification.description,
    date: new Date(notification.date),
    read: notification.read,
    icon: notificationIcons[notification.category] ?? AlertCircle,
  }
}

function sanitizePatient(raw: unknown, index: number): Patient | string {
  if (!isRecord(raw)) return `patients[${index}] inválido`
  if (!isNonEmptyString(raw.id)) return `patients[${index}].id inválido`
  if (!isNonEmptyString(raw.name)) return `patients[${index}].name inválido`
  if (typeof raw.cpf !== "string") return `patients[${index}].cpf inválido`
  if (typeof raw.email !== "string") return `patients[${index}].email inválido`
  if (typeof raw.phone !== "string") return `patients[${index}].phone inválido`
  if (typeof raw.complaint !== "string") {
    return `patients[${index}].complaint inválido`
  }
  if (
    typeof raw.modality !== "string" ||
    !PATIENT_MODALITIES.has(raw.modality as PatientModality)
  ) {
    return `patients[${index}].modality inválido`
  }
  if (typeof raw.price !== "string") return `patients[${index}].price inválido`
  if (
    typeof raw.status !== "string" ||
    !PATIENT_STATUSES.has(raw.status as PatientStatus)
  ) {
    return `patients[${index}].status inválido`
  }
  if (typeof raw.sessionDay !== "string") {
    return `patients[${index}].sessionDay inválido`
  }
  if (typeof raw.sessionTime !== "string") {
    return `patients[${index}].sessionTime inválido`
  }
  if (typeof raw.sessionDuration !== "number" || !Number.isFinite(raw.sessionDuration)) {
    return `patients[${index}].sessionDuration inválido`
  }
  if (typeof raw.sessions !== "number" || !Number.isFinite(raw.sessions)) {
    return `patients[${index}].sessions inválido`
  }
  if (typeof raw.since !== "string") return `patients[${index}].since inválido`
  if (
    raw.nextSession !== null &&
    raw.nextSession !== undefined &&
    typeof raw.nextSession !== "string"
  ) {
    return `patients[${index}].nextSession inválido`
  }

  const patient: Patient = {
    id: raw.id.trim(),
    name: raw.name.trim(),
    cpf: raw.cpf,
    email: raw.email,
    phone: raw.phone,
    complaint: raw.complaint,
    modality: raw.modality as PatientModality,
    price: raw.price,
    status: raw.status as PatientStatus,
    sessionDay: raw.sessionDay,
    sessionTime: raw.sessionTime,
    sessionDuration: raw.sessionDuration,
    nextSession: (raw.nextSession as string | null) ?? null,
    sessions: Math.max(0, Math.floor(raw.sessions)),
    since: raw.since,
  }

  if (raw.sessionFrequency !== undefined) {
    if (
      typeof raw.sessionFrequency !== "string" ||
      !SESSION_FREQUENCIES.has(raw.sessionFrequency as SessionFrequency)
    ) {
      return `patients[${index}].sessionFrequency inválido`
    }
    patient.sessionFrequency = raw.sessionFrequency as SessionFrequency
  }

  if (raw.paymentOverdueManual !== undefined && raw.paymentOverdueManual !== null) {
    if (typeof raw.paymentOverdueManual !== "boolean") {
      return `patients[${index}].paymentOverdueManual inválido`
    }
    patient.paymentOverdueManual = raw.paymentOverdueManual
  } else if (raw.paymentOverdueManual === null) {
    patient.paymentOverdueManual = null
  }

  const optionalStrings = [
    "birthDate",
    "gender",
    "cep",
    "street",
    "number",
    "complement",
    "neighborhood",
    "city",
    "state",
    "contactName",
    "contactPhone",
    "contactRelation",
    "patientType",
    "therapyStart",
    "referral",
    "notes",
    "recurrenceFrom",
  ] as const

  for (const key of optionalStrings) {
    if (raw[key] === undefined) continue
    if (typeof raw[key] !== "string") {
      return `patients[${index}].${key} inválido`
    }
    if (key === "recurrenceFrom" && raw[key] && !ISO_DATE_ONLY_RE.test(raw[key] as string)) {
      return `patients[${index}].recurrenceFrom inválido`
    }
    patient[key] = raw[key] as string
  }

  if (raw.schedules !== undefined) {
    if (!Array.isArray(raw.schedules)) {
      return `patients[${index}].schedules inválido`
    }
    const schedules = []
    for (let i = 0; i < raw.schedules.length; i++) {
      const item = raw.schedules[i]
      if (!isRecord(item)) return `patients[${index}].schedules[${i}] inválido`
      if (typeof item.weekday !== "string") {
        return `patients[${index}].schedules[${i}].weekday inválido`
      }
      if (typeof item.time !== "string") {
        return `patients[${index}].schedules[${i}].time inválido`
      }
      if (typeof item.duration !== "string") {
        return `patients[${index}].schedules[${i}].duration inválido`
      }
      if (
        item.modality !== "" &&
        (typeof item.modality !== "string" ||
          !PATIENT_MODALITIES.has(item.modality as PatientModality))
      ) {
        return `patients[${index}].schedules[${i}].modality inválido`
      }
      schedules.push({
        weekday: item.weekday,
        time: item.time,
        duration: item.duration,
        modality: item.modality as PatientModality | "",
      })
    }
    patient.schedules = schedules
  }

  return patient
}

function sanitizeEvent(
  raw: unknown,
  index: number,
  patientIds: Set<string>
): StoredCalendarEvent | string {
  if (!isRecord(raw)) return `events[${index}] inválido`
  if (!isNonEmptyString(raw.id)) return `events[${index}].id inválido`
  if (typeof raw.patientId !== "string") return `events[${index}].patientId inválido`
  if (raw.patientId && !patientIds.has(raw.patientId)) {
    return `events[${index}] referencia paciente inexistente`
  }
  if (!isNonEmptyString(raw.title)) return `events[${index}].title inválido`
  if (typeof raw.date !== "string" || !isLooseIsoDate(raw.date)) {
    return `events[${index}].date inválido`
  }
  if (!isValidTime(raw.start)) return `events[${index}].start inválido`
  if (!isValidTime(raw.end)) return `events[${index}].end inválido`

  const event: StoredCalendarEvent = {
    id: raw.id.trim(),
    patientId: raw.patientId,
    title: raw.title.trim(),
    date: raw.date,
    start: raw.start,
    end: raw.end,
  }

  if (raw.status !== undefined) {
    if (
      typeof raw.status !== "string" ||
      !SESSION_STATUSES.has(raw.status as SessionStatus)
    ) {
      return `events[${index}].status inválido`
    }
    event.status = raw.status as SessionStatus
  }

  if (raw.amount !== undefined) {
    if (typeof raw.amount !== "number" || !Number.isFinite(raw.amount) || raw.amount < 0) {
      return `events[${index}].amount inválido`
    }
    event.amount = raw.amount
  }

  if (raw.paid !== undefined) {
    if (typeof raw.paid !== "boolean") return `events[${index}].paid inválido`
    event.paid = raw.paid
  }

  if (raw.absenceWithNotice !== undefined) {
    if (typeof raw.absenceWithNotice !== "boolean") {
      return `events[${index}].absenceWithNotice inválido`
    }
    event.absenceWithNotice = raw.absenceWithNotice
  }

  if (raw.modality !== undefined) {
    if (
      typeof raw.modality !== "string" ||
      !EVENT_MODALITIES.has(raw.modality)
    ) {
      return `events[${index}].modality inválido`
    }
    event.modality = raw.modality as "presencial" | "online"
  }

  if (raw.rescheduledFrom !== undefined) {
    if (!isRecord(raw.rescheduledFrom)) {
      return `events[${index}].rescheduledFrom inválido`
    }
    if (
      typeof raw.rescheduledFrom.date !== "string" ||
      !isLooseIsoDate(raw.rescheduledFrom.date)
    ) {
      return `events[${index}].rescheduledFrom.date inválido`
    }
    if (!isValidTime(raw.rescheduledFrom.start)) {
      return `events[${index}].rescheduledFrom.start inválido`
    }
    if (!isValidTime(raw.rescheduledFrom.end)) {
      return `events[${index}].rescheduledFrom.end inválido`
    }
    event.rescheduledFrom = {
      date: raw.rescheduledFrom.date,
      start: raw.rescheduledFrom.start,
      end: raw.rescheduledFrom.end,
    }
  }

  return event
}

function sanitizeSessionNote(
  raw: unknown,
  index: number,
  patientIds: Set<string>
): SessionNote | string {
  if (!isRecord(raw)) return `sessionNotes[${index}] inválido`
  if (!isNonEmptyString(raw.id)) return `sessionNotes[${index}].id inválido`
  if (!isNonEmptyString(raw.patientId)) {
    return `sessionNotes[${index}].patientId inválido`
  }
  if (!patientIds.has(raw.patientId)) {
    return `sessionNotes[${index}] referencia paciente inexistente`
  }
  if (typeof raw.date !== "string") return `sessionNotes[${index}].date inválido`
  if (raw.sessionNumber !== undefined) {
    if (
      typeof raw.sessionNumber !== "number" ||
      !Number.isFinite(raw.sessionNumber)
    ) {
      return `sessionNotes[${index}].sessionNumber inválido`
    }
  }
  if (raw.eventId !== undefined && typeof raw.eventId !== "string") {
    return `sessionNotes[${index}].eventId inválido`
  }
  if (typeof raw.summary !== "string") {
    return `sessionNotes[${index}].summary inválido`
  }
  if (typeof raw.evolution !== "string") {
    return `sessionNotes[${index}].evolution inválido`
  }

  const note: SessionNote = {
    id: raw.id.trim(),
    patientId: raw.patientId.trim(),
    date: raw.date,
    summary: raw.summary,
    evolution: raw.evolution,
  }

  if (typeof raw.eventId === "string" && raw.eventId.trim()) {
    note.eventId = raw.eventId.trim()
  }
  if (typeof raw.sessionNumber === "number" && Number.isFinite(raw.sessionNumber)) {
    note.sessionNumber = Math.max(0, Math.floor(raw.sessionNumber))
  }

  if (raw.plan !== undefined) {
    if (typeof raw.plan !== "string") return `sessionNotes[${index}].plan inválido`
    note.plan = raw.plan
  }
  if (raw.mood !== undefined) {
    if (typeof raw.mood !== "string") return `sessionNotes[${index}].mood inválido`
    note.mood = raw.mood
  }
  if (raw.modality !== undefined) {
    if (
      typeof raw.modality !== "string" ||
      !PATIENT_MODALITIES.has(raw.modality as PatientModality)
    ) {
      return `sessionNotes[${index}].modality inválido`
    }
    note.modality = raw.modality as PatientModality
  }
  if (raw.tags !== undefined) {
    if (!Array.isArray(raw.tags) || raw.tags.some((tag) => typeof tag !== "string")) {
      return `sessionNotes[${index}].tags inválido`
    }
    note.tags = raw.tags as string[]
  }

  return note
}

function sanitizeNotification(
  raw: unknown,
  index: number
): StoredNotification | string {
  if (!isRecord(raw)) return `notifications[${index}] inválido`
  if (!isNonEmptyString(raw.id)) return `notifications[${index}].id inválido`
  if (
    typeof raw.category !== "string" ||
    !NOTIFICATION_CATEGORIES.has(raw.category as NotificationCategory)
  ) {
    return `notifications[${index}].category inválido`
  }
  if (!isNonEmptyString(raw.title)) return `notifications[${index}].title inválido`
  if (typeof raw.description !== "string") {
    return `notifications[${index}].description inválido`
  }
  if (typeof raw.date !== "string" || !isLooseIsoDate(raw.date)) {
    return `notifications[${index}].date inválido`
  }
  if (typeof raw.read !== "boolean") return `notifications[${index}].read inválido`

  return {
    id: raw.id.trim(),
    category: raw.category as NotificationCategory,
    title: raw.title.trim(),
    description: raw.description,
    date: raw.date,
    read: raw.read,
  }
}

function sanitizePreferences(raw: unknown): ClinicBackupPreferences | string {
  if (!isRecord(raw)) return "preferences inválido"

  const notificationsRaw = raw.notifications
  const notifications = { ...DEFAULT_NOTIFICATION_PREFERENCES }
  if (notificationsRaw !== undefined) {
    if (!isRecord(notificationsRaw)) return "preferences.notifications inválido"
    for (const key of NOTIFICATION_PREFERENCE_KEYS) {
      if (notificationsRaw[key] === undefined) continue
      if (typeof notificationsRaw[key] !== "boolean") {
        return `preferences.notifications.${key} inválido`
      }
      notifications[key] = notificationsRaw[key] as boolean
    }
  }

  let theme: ThemeId
  if (raw.theme === undefined) {
    theme = DEFAULT_THEME
  } else if (typeof raw.theme === "string" && isThemeId(raw.theme)) {
    theme = raw.theme
  } else if (
    typeof raw.theme === "string" &&
    (raw.theme === "forja" ||
      raw.theme === "entardecer" ||
      raw.theme === "profundo")
  ) {
    theme = DEFAULT_THEME
  } else if (typeof raw.theme === "string" && raw.theme === "luar") {
    theme = "grafite"
  } else {
    return "preferences.theme inválido"
  }

  let density: DensityId
  if (raw.density === undefined) {
    density = DEFAULT_DENSITY
  } else if (typeof raw.density === "string" && isDensityId(raw.density)) {
    density = raw.density
  } else {
    return "preferences.density inválido"
  }

  let locale: Locale
  if (raw.locale === undefined) {
    locale = DEFAULT_LOCALE
  } else if (typeof raw.locale === "string" && isLocale(raw.locale)) {
    locale = raw.locale
  } else {
    return "preferences.locale inválido"
  }

  let toastPosition: ToastPosition
  if (raw.toastPosition === undefined) {
    toastPosition = DEFAULT_TOAST_POSITION
  } else if (
    typeof raw.toastPosition === "string" &&
    isToastPosition(raw.toastPosition)
  ) {
    toastPosition = raw.toastPosition
  } else {
    return "preferences.toastPosition inválido"
  }

  return {
    notifications,
    theme,
    density,
    locale,
    toastPosition,
  }
}

export function buildClinicBackupFile(input: {
  profileName: string
  clinic: GuestClinicSnapshot
  preferences?: ClinicBackupPreferences
}): ClinicBackupFile {
  const preferences =
    input.preferences ??
    ({
      notifications: readStoredNotificationPreferences(),
      theme: readStoredTheme(),
      density: readStoredDensity(),
      locale: readStoredLocale(),
      toastPosition: readStoredToastPosition(),
    } satisfies ClinicBackupPreferences)

  return {
    kind: BACKUP_KIND,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    notice:
      "ATENÇÃO: Este arquivo contém dados clínicos sensíveis. Guarde-o em local seguro e não compartilhe.",
    profile: {
      name: input.profileName.trim() || "Convidado",
    },
    clinic: {
      patients: input.clinic.patients,
      events: input.clinic.events.map(serializeEvent),
      sessionNotes: input.clinic.sessionNotes,
      notifications: input.clinic.notifications.map(serializeNotification),
    },
    preferences,
  }
}

export function downloadClinicBackup(backup: ClinicBackupFile) {
  const stamp = new Date().toISOString().slice(0, 10)
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `lume-backup-${stamp}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseClinicBackupJson(raw: string): BackupParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: "invalidJson" }
  }

  if (!isRecord(parsed)) return { ok: false, error: "invalidStructure" }
  if (parsed.kind !== BACKUP_KIND) return { ok: false, error: "invalidKind" }
  if (typeof parsed.schemaVersion !== "number") {
    return { ok: false, error: "invalidSchemaVersion" }
  }
  if (parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return { ok: false, error: "unsupportedSchemaVersion" }
  }
  if (parsed.schemaVersion < 1) {
    return { ok: false, error: "invalidSchemaVersion" }
  }
  if (typeof parsed.appVersion !== "string") {
    return { ok: false, error: "invalidAppVersion" }
  }
  if (typeof parsed.exportedAt !== "string" || !isLooseIsoDate(parsed.exportedAt)) {
    return { ok: false, error: "invalidExportedAt" }
  }
  if (!isRecord(parsed.profile) || !isNonEmptyString(parsed.profile.name)) {
    return { ok: false, error: "invalidProfile" }
  }
  if (!isRecord(parsed.clinic)) return { ok: false, error: "invalidClinic" }
  if (!Array.isArray(parsed.clinic.patients)) {
    return { ok: false, error: "invalidPatients" }
  }
  if (!Array.isArray(parsed.clinic.events)) {
    return { ok: false, error: "invalidEvents" }
  }
  if (!Array.isArray(parsed.clinic.sessionNotes)) {
    return { ok: false, error: "invalidSessionNotes" }
  }
  if (!Array.isArray(parsed.clinic.notifications)) {
    return { ok: false, error: "invalidNotifications" }
  }

  const preferencesResult = sanitizePreferences(parsed.preferences)
  if (typeof preferencesResult === "string") {
    return { ok: false, error: "invalidPreferences" }
  }

  const patients: Patient[] = []
  const patientIds = new Set<string>()
  for (let i = 0; i < parsed.clinic.patients.length; i++) {
    const result = sanitizePatient(parsed.clinic.patients[i], i)
    if (typeof result === "string") return { ok: false, error: "invalidPatients" }
    if (patientIds.has(result.id)) return { ok: false, error: "duplicatePatientIds" }
    patientIds.add(result.id)
    patients.push(result)
  }

  const events: StoredCalendarEvent[] = []
  const eventIds = new Set<string>()
  for (let i = 0; i < parsed.clinic.events.length; i++) {
    const result = sanitizeEvent(parsed.clinic.events[i], i, patientIds)
    if (typeof result === "string") return { ok: false, error: "invalidEvents" }
    if (eventIds.has(result.id)) return { ok: false, error: "duplicateEventIds" }
    eventIds.add(result.id)
    events.push(result)
  }

  const sessionNotes: SessionNote[] = []
  const noteIds = new Set<string>()
  for (let i = 0; i < parsed.clinic.sessionNotes.length; i++) {
    const result = sanitizeSessionNote(parsed.clinic.sessionNotes[i], i, patientIds)
    if (typeof result === "string") return { ok: false, error: "invalidSessionNotes" }
    if (noteIds.has(result.id)) return { ok: false, error: "duplicateSessionNoteIds" }
    noteIds.add(result.id)
    sessionNotes.push(result)
  }

  const notifications: StoredNotification[] = []
  const notificationIds = new Set<string>()
  for (let i = 0; i < parsed.clinic.notifications.length; i++) {
    const result = sanitizeNotification(parsed.clinic.notifications[i], i)
    if (typeof result === "string") return { ok: false, error: "invalidNotifications" }
    if (notificationIds.has(result.id)) {
      return { ok: false, error: "duplicateNotificationIds" }
    }
    notificationIds.add(result.id)
    notifications.push(result)
  }

  const clinicNotifications =
    notifications.length > 0
      ? notifications.map(deserializeNotification)
      : [createWelcomeNotification()]

  return {
    ok: true,
    backup: {
      profileName: parsed.profile.name.trim(),
      exportedAt: parsed.exportedAt,
      appVersion: parsed.appVersion,
      schemaVersion: parsed.schemaVersion,
      preferences: preferencesResult,
      clinic: {
        patients,
        events: events.map(deserializeEvent),
        sessionNotes,
        notifications: clinicNotifications,
      },
    },
  }
}

export async function readBackupFile(file: File): Promise<BackupParseResult> {
  if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
    return { ok: false, error: "invalidFileType" }
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "fileTooLarge" }
  }
  try {
    const text = await file.text()
    return parseClinicBackupJson(text)
  } catch {
    return { ok: false, error: "readFailed" }
  }
}

export function summarizeMergeConflicts(
  current: GuestClinicSnapshot,
  incoming: GuestClinicSnapshot
): MergeConflictSummary {
  const patientIds = new Set(current.patients.map((item) => item.id))
  const eventIds = new Set(current.events.map((item) => item.id))
  const noteIds = new Set(current.sessionNotes.map((item) => item.id))

  const patients = incoming.patients.filter((item) => patientIds.has(item.id)).length
  const events = incoming.events.filter((item) => eventIds.has(item.id)).length
  const sessionNotes = incoming.sessionNotes.filter((item) =>
    noteIds.has(item.id)
  ).length

  return {
    patients,
    events,
    sessionNotes,
    total: patients + events + sessionNotes,
  }
}

export function mergeClinicSnapshots(
  current: GuestClinicSnapshot,
  incoming: GuestClinicSnapshot,
  overwriteConflicts: boolean
): GuestClinicSnapshot {
  const patientsById = new Map(current.patients.map((item) => [item.id, item]))
  const eventsById = new Map(current.events.map((item) => [item.id, item]))
  const notesById = new Map(current.sessionNotes.map((item) => [item.id, item]))
  const notificationsById = new Map(
    current.notifications.map((item) => [item.id, item])
  )

  for (const patient of incoming.patients) {
    if (!patientsById.has(patient.id) || overwriteConflicts) {
      patientsById.set(patient.id, patient)
    }
  }
  for (const event of incoming.events) {
    if (!eventsById.has(event.id) || overwriteConflicts) {
      eventsById.set(event.id, event)
    }
  }
  for (const note of incoming.sessionNotes) {
    if (!notesById.has(note.id) || overwriteConflicts) {
      notesById.set(note.id, note)
    }
  }
  for (const notification of incoming.notifications) {
    if (!notificationsById.has(notification.id) || overwriteConflicts) {
      notificationsById.set(notification.id, notification)
    }
  }

  return {
    patients: Array.from(patientsById.values()),
    events: Array.from(eventsById.values()),
    sessionNotes: Array.from(notesById.values()),
    notifications: Array.from(notificationsById.values()),
  }
}

export function applyBackupPreferences(preferences: ClinicBackupPreferences) {
  persistNotificationPreferences(preferences.notifications)
  persistTheme(preferences.theme)
  persistDensity(preferences.density)
  persistLocale(preferences.locale)
  persistToastPosition(preferences.toastPosition)
}

export function applyBackupProfileName(name: string) {
  const trimmed = name.trim()
  if (trimmed.length >= 2) {
    persistGuestProfileName(trimmed)
  }
}

export function currentGuestProfileName(fallback = "Convidado") {
  return readGuestProfileName() ?? fallback
}

export function currentBackupPreferences(): ClinicBackupPreferences {
  return {
    notifications: readStoredNotificationPreferences(),
    theme: readStoredTheme(),
    density: readStoredDensity(),
    locale: readStoredLocale(),
    toastPosition: readStoredToastPosition(),
  }
}

/** Exposto para testes de serialização round-trip. */
export function __serializeEventForTests(event: CalendarEvent) {
  return serializeEvent(event)
}

export function __isValidIsoDateForTests(value: string) {
  return isValidIsoDate(value)
}
