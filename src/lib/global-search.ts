import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bell,
  Calendar,
  CalendarPlus,
  CircleDollarSign,
  FileSpreadsheet,
  Home,
  Inbox,
  Mail,
  Map as MapIcon,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"

import type {
  CalendarEvent,
  InboxEmail,
  Notification,
  Patient,
  SessionStatus,
} from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import { APP_PAGE_ID, IS_ROADMAP_VISIBLE, type AppPageId } from "@/lib/app-pages"
import { addDays } from "@/data/patients"
import { intlLocale, type Locale } from "@/lib/locale"

const SEARCH_EVENT_PAST_DAYS = 21
const SEARCH_EVENT_FUTURE_DAYS = 90
const SEARCH_EVENT_LIMIT = 80

const NAV_PAGE_CONFIG: {
  id: string
  pageId: AppPageId
  icon: LucideIcon
}[] = [
  { id: "nav-home", pageId: APP_PAGE_ID.inicio, icon: Home },
  { id: "nav-inbox", pageId: APP_PAGE_ID.caixaEntrada, icon: Inbox },
  { id: "nav-agenda", pageId: APP_PAGE_ID.agenda, icon: Calendar },
  { id: "nav-pacientes", pageId: APP_PAGE_ID.pacientes, icon: Users },
  { id: "nav-financeiro", pageId: APP_PAGE_ID.financeiro, icon: Wallet },
  { id: "nav-a-receber", pageId: APP_PAGE_ID.aReceber, icon: CircleDollarSign },
  { id: "nav-notifications", pageId: APP_PAGE_ID.notificacoes, icon: Bell },
  { id: "nav-relatorios", pageId: APP_PAGE_ID.relatorios, icon: BarChart3 },
  { id: "nav-dados", pageId: APP_PAGE_ID.dados, icon: FileSpreadsheet },
  ...(IS_ROADMAP_VISIBLE
    ? [{ id: "nav-roadmap", pageId: APP_PAGE_ID.roteiro, icon: MapIcon }]
    : []),
]

export type QuickActionId = "new-patient" | "new-session"

export type GlobalSearchAction =
  | { type: "navigate"; page: AppPageId }
  | {
      type: "patient"
      patientId: string
      tab?: "overview" | "sessions" | "records"
    }
  | { type: "event"; dateTimestamp: number }
  | { type: "email"; emailId: string }
  | { type: "notification"; notificationId: string }
  | { type: "quick"; id: QuickActionId }

export type GlobalSearchQuickAction = {
  id: QuickActionId
  title: string
  subtitle: string
  icon: LucideIcon
  action: GlobalSearchAction
}

export type GlobalSearchItem = {
  id: string
  group: string
  title: string
  subtitle?: string
  value: string
  icon: LucideIcon
  action: GlobalSearchAction
}

export function buildGlobalSearchQuickActions(
  t: TranslateFn
): GlobalSearchQuickAction[] {
  return [
    {
      id: "new-patient",
      title: t("search.quickActions.newPatient.title"),
      subtitle: t("search.quickActions.newPatient.subtitle"),
      icon: UserPlus,
      action: { type: "quick", id: "new-patient" },
    },
    {
      id: "new-session",
      title: t("search.quickActions.newSession.title"),
      subtitle: t("search.quickActions.newSession.subtitle"),
      icon: CalendarPlus,
      action: { type: "quick", id: "new-session" },
    },
  ]
}

function buildNavigationItems(t: TranslateFn): GlobalSearchItem[] {
  return NAV_PAGE_CONFIG.map(({ id, pageId, icon }) => ({
    id,
    group: t("search.groups.navigation"),
    title: t(`nav.pages.${pageId}`),
    subtitle: t(`nav.subtitles.${pageId}`),
    value: t(`nav.keywords.${pageId}`),
    icon,
    action: { type: "navigate", page: pageId },
  }))
}

function formatEventDate(date: Date, locale: Locale) {
  return date.toLocaleDateString(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function sessionStatusLabel(t: TranslateFn, status: SessionStatus) {
  return t(`enums.sessionStatus.${status}`)
}

function buildPatientItems(
  patients: Patient[],
  t: TranslateFn
): GlobalSearchItem[] {
  return patients.map((patient) => ({
    id: `patient-${patient.id}`,
    group: t("search.groups.patients"),
    title: patient.name,
    subtitle: [patient.email, patient.complaint, patient.cpf]
      .filter(Boolean)
      .join(" · "),
    value: [
      patient.name,
      patient.email,
      patient.cpf,
      patient.phone,
      patient.complaint,
    ]
      .join(" ")
      .toLowerCase(),
    icon: User,
    action: { type: "patient", patientId: patient.id },
  }))
}

function buildEventItems(
  events: CalendarEvent[],
  patients: Patient[],
  t: TranslateFn,
  locale: Locale
): GlobalSearchItem[] {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const rangeStart = addDays(today, -SEARCH_EVENT_PAST_DAYS)
  const rangeEnd = addDays(today, SEARCH_EVENT_FUTURE_DAYS)

  return events
    .filter((event) => {
      const date = new Date(event.date)
      date.setHours(0, 0, 0, 0)
      return date >= rangeStart && date <= rangeEnd
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, SEARCH_EVENT_LIMIT)
    .map((event) => {
      const patient = patientById.get(event.patientId)
      const status = event.status ?? "agendada"
      const statusLabel = sessionStatusLabel(t, status)

      return {
        id: `event-${event.id}`,
        group: t("search.groups.sessions"),
        title: event.title,
        subtitle: `${formatEventDate(event.date, locale)} · ${event.start}–${event.end} · ${statusLabel}${patient ? ` · ${patient.name}` : ""}`,
        value: [
          event.title,
          patient?.name,
          formatEventDate(event.date, locale),
          event.start,
          event.end,
          statusLabel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
        icon: Calendar,
        action: { type: "event", dateTimestamp: event.date.getTime() },
      }
    })
}

function buildEmailItems(
  emails: InboxEmail[],
  t: TranslateFn
): GlobalSearchItem[] {
  return emails.map((email) => ({
    id: `email-${email.id}`,
    group: t("search.groups.emails"),
    title: email.subject,
    subtitle: `${email.name} · ${email.preview}`,
    value: [email.name, email.email, email.subject, email.preview]
      .join(" ")
      .toLowerCase(),
    icon: Mail,
    action: { type: "email", emailId: email.id },
  }))
}

function buildNotificationItems(
  notifications: Notification[],
  t: TranslateFn
): GlobalSearchItem[] {
  return notifications.map((notification) => ({
    id: `notification-${notification.id}`,
    group: t("search.groups.notifications"),
    title: notification.title,
    subtitle: notification.description,
    value: [notification.title, notification.description, notification.category]
      .join(" ")
      .toLowerCase(),
    icon: notification.icon,
    action: { type: "notification", notificationId: notification.id },
  }))
}

export function buildGlobalSearchItems(input: {
  patients: Patient[]
  events: CalendarEvent[]
  emails: InboxEmail[]
  notifications: Notification[]
  t: TranslateFn
  locale: Locale
}): GlobalSearchItem[] {
  return [
    ...buildNavigationItems(input.t),
    ...buildPatientItems(input.patients, input.t),
    ...buildEventItems(input.events, input.patients, input.t, input.locale),
    ...buildEmailItems(input.emails, input.t),
    ...buildNotificationItems(input.notifications, input.t),
  ]
}

export function groupSearchItems(
  items: GlobalSearchItem[]
): [string, GlobalSearchItem[]][] {
  const groups = new Map<string, GlobalSearchItem[]>()

  for (const item of items) {
    const bucket = groups.get(item.group) ?? []
    bucket.push(item)
    groups.set(item.group, bucket)
  }

  return Array.from(groups.entries())
}
