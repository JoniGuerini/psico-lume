import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Mail,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import type {
  CalendarEvent,
  Notification,
  NotificationCategory,
  Patient,
  SessionNote,
} from "@/data/types"
import { clearOnboardingTourCompleted } from "@/lib/onboarding-tour"

export const GUEST_CLINIC_STORAGE_KEY = "lume-guest-clinic"
export const GUEST_PROFILE_STORAGE_KEY = "lume-guest-profile"

type GuestProfile = {
  name: string
}

export function readGuestProfileName(): string | null {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GuestProfile
    const name = parsed.name?.trim()
    return name && name.length >= 2 ? name : null
  } catch {
    return null
  }
}

export function persistGuestProfileName(name: string) {
  localStorage.setItem(
    GUEST_PROFILE_STORAGE_KEY,
    JSON.stringify({ name: name.trim() })
  )
}

type StoredRescheduledFrom = {
  date: string
  start: string
  end: string
}

type StoredCalendarEvent = Omit<CalendarEvent, "date" | "rescheduledFrom"> & {
  date: string
  rescheduledFrom?: StoredRescheduledFrom
}

type StoredNotification = Omit<Notification, "icon" | "date"> & {
  date: string
}

export type GuestClinicSnapshot = {
  patients: Patient[]
  events: CalendarEvent[]
  sessionNotes: SessionNote[]
  notifications: Notification[]
}

type StoredGuestClinicSnapshot = {
  patients: Patient[]
  events: StoredCalendarEvent[]
  sessionNotes: SessionNote[]
  notifications: StoredNotification[]
}

const notificationIcons: Record<NotificationCategory, LucideIcon> = {
  sessao: CalendarClock,
  paciente: UserRound,
  mensagem: Mail,
  financeiro: CreditCard,
  sistema: ClipboardList,
}

function serializeEvent(event: CalendarEvent): StoredCalendarEvent {
  return {
    ...event,
    date: event.date.toISOString(),
    rescheduledFrom: event.rescheduledFrom
      ? {
          ...event.rescheduledFrom,
          date: event.rescheduledFrom.date.toISOString(),
        }
      : undefined,
  }
}

function deserializeEvent(event: StoredCalendarEvent): CalendarEvent {
  return {
    ...event,
    date: new Date(event.date),
    rescheduledFrom: event.rescheduledFrom
      ? {
          ...event.rescheduledFrom,
          date: new Date(event.rescheduledFrom.date),
        }
      : undefined,
  }
}

function serializeNotification(
  notification: Notification
): StoredNotification {
  return {
    id: notification.id,
    category: notification.category,
    title: notification.title,
    description: notification.description,
    date: notification.date.toISOString(),
    read: notification.read,
  }
}

function deserializeNotification(
  notification: StoredNotification
): Notification {
  return {
    ...notification,
    date: new Date(notification.date),
    icon: notificationIcons[notification.category] ?? AlertCircle,
  }
}

export function createWelcomeNotification(): Notification {
  return {
    id: "guest-welcome",
    icon: ClipboardList,
    category: "sistema",
    title: "Bem-vindo ao Lume",
    description:
      "Você está no modo convidado. Pacientes, agenda e prontuários ficam salvos apenas neste navegador.",
    date: new Date(),
    read: false,
  }
}

export function createEmptyGuestClinicSnapshot(): GuestClinicSnapshot {
  return {
    patients: [],
    events: [],
    sessionNotes: [],
    notifications: [createWelcomeNotification()],
  }
}

export function loadGuestClinicSnapshot(): GuestClinicSnapshot | null {
  try {
    const raw = localStorage.getItem(GUEST_CLINIC_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredGuestClinicSnapshot
    if (!Array.isArray(parsed.patients) || !Array.isArray(parsed.events)) {
      return null
    }

    return {
      patients: parsed.patients,
      events: parsed.events.map(deserializeEvent),
      sessionNotes: Array.isArray(parsed.sessionNotes)
        ? parsed.sessionNotes
        : [],
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications.map(deserializeNotification)
        : [createWelcomeNotification()],
    }
  } catch {
    return null
  }
}

export function saveGuestClinicSnapshot(snapshot: GuestClinicSnapshot) {
  const stored: StoredGuestClinicSnapshot = {
    patients: snapshot.patients,
    sessionNotes: snapshot.sessionNotes,
    events: snapshot.events.map(serializeEvent),
    notifications: snapshot.notifications.map(serializeNotification),
  }
  localStorage.setItem(GUEST_CLINIC_STORAGE_KEY, JSON.stringify(stored))
}

export function clearGuestClinicSnapshot() {
  localStorage.removeItem(GUEST_CLINIC_STORAGE_KEY)
}

export function clearGuestProfileName() {
  localStorage.removeItem(GUEST_PROFILE_STORAGE_KEY)
}

/** Remove perfil convidado, dados locais da clínica e estado do tour de onboarding. */
export function clearGuestLocalData() {
  clearGuestClinicSnapshot()
  clearGuestProfileName()
  clearOnboardingTourCompleted()
}
