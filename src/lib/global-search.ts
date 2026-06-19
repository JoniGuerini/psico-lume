import type { LucideIcon } from "lucide-react"
import {
  Bell,
  Calendar,
  CalendarPlus,
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
} from "@/data/types"
import { sessionStatusConfig } from "@/lib/session-status"

export type QuickActionId = "new-patient" | "new-session"

export type GlobalSearchAction =
  | { type: "navigate"; page: string }
  | {
      type: "patient"
      patientId: string
      tab?: "overview" | "sessions" | "records"
    }
  | { type: "event"; eventId: string }
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

export const globalSearchQuickActions: GlobalSearchQuickAction[] = [
  {
    id: "new-patient",
    title: "Novo paciente",
    subtitle: "Cadastrar na clínica",
    icon: UserPlus,
    action: { type: "quick", id: "new-patient" },
  },
  {
    id: "new-session",
    title: "Novo atendimento",
    subtitle: "Agendar sessão",
    icon: CalendarPlus,
    action: { type: "quick", id: "new-session" },
  },
]

export type GlobalSearchItem = {
  id: string
  group: string
  title: string
  subtitle?: string
  value: string
  icon: LucideIcon
  action: GlobalSearchAction
}

const navigationItems: GlobalSearchItem[] = [
  {
    id: "nav-home",
    group: "Navegação",
    title: "Home",
    subtitle: "Painel do dia",
    value: "home painel dashboard início",
    icon: Home,
    action: { type: "navigate", page: "Home" },
  },
  {
    id: "nav-inbox",
    group: "Navegação",
    title: "Inbox",
    subtitle: "E-mails",
    value: "inbox e-mails mensagens",
    icon: Inbox,
    action: { type: "navigate", page: "Inbox" },
  },
  {
    id: "nav-agenda",
    group: "Navegação",
    title: "Agenda",
    subtitle: "Calendário de sessões",
    value: "agenda calendário sessões atendimentos",
    icon: Calendar,
    action: { type: "navigate", page: "Agenda" },
  },
  {
    id: "nav-pacientes",
    group: "Navegação",
    title: "Pacientes",
    subtitle: "Lista e perfis",
    value: "pacientes lista perfis cadastro",
    icon: Users,
    action: { type: "navigate", page: "Pacientes" },
  },
  {
    id: "nav-financeiro",
    group: "Navegação",
    title: "Financeiro",
    subtitle: "Receita e inadimplência",
    value: "financeiro receita pagamentos inadimplência",
    icon: Wallet,
    action: { type: "navigate", page: "Financeiro" },
  },
  {
    id: "nav-notifications",
    group: "Navegação",
    title: "Notificações",
    subtitle: "Alertas da clínica",
    value: "notificações alertas avisos",
    icon: Bell,
    action: { type: "navigate", page: "Notifications" },
  },
  {
    id: "nav-roadmap",
    group: "Navegação",
    title: "Roadmap",
    subtitle: "Progresso do produto",
    value: "roadmap progresso versão",
    icon: MapIcon,
    action: { type: "navigate", page: "Roadmap" },
  },
]

function formatEventDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function buildPatientItems(patients: Patient[]): GlobalSearchItem[] {
  return patients.map((patient) => ({
    id: `patient-${patient.id}`,
    group: "Pacientes",
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
      patient.approach,
    ]
      .join(" ")
      .toLowerCase(),
    icon: User,
    action: { type: "patient", patientId: patient.id },
  }))
}

function buildEventItems(
  events: CalendarEvent[],
  patients: Patient[]
): GlobalSearchItem[] {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))

  return events.map((event) => {
    const patient = patientById.get(event.patientId)
    const status = event.status ?? "agendada"
    const statusLabel = sessionStatusConfig[status].label

    return {
      id: `event-${event.id}`,
      group: "Sessões",
      title: event.title,
      subtitle: `${formatEventDate(event.date)} · ${event.start}–${event.end} · ${statusLabel}${patient ? ` · ${patient.name}` : ""}`,
      value: [
        event.title,
        patient?.name,
        formatEventDate(event.date),
        event.start,
        event.end,
        statusLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      icon: Calendar,
      action: { type: "event", eventId: event.id },
    }
  })
}

function buildEmailItems(emails: InboxEmail[]): GlobalSearchItem[] {
  return emails.map((email) => ({
    id: `email-${email.id}`,
    group: "E-mails",
    title: email.subject,
    subtitle: `${email.name} · ${email.preview}`,
    value: [email.name, email.email, email.subject, email.preview, email.body.join(" ")]
      .join(" ")
      .toLowerCase(),
    icon: Mail,
    action: { type: "email", emailId: email.id },
  }))
}

function buildNotificationItems(
  notifications: Notification[]
): GlobalSearchItem[] {
  return notifications.map((notification) => ({
    id: `notification-${notification.id}`,
    group: "Notificações",
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
}): GlobalSearchItem[] {
  return [
    ...navigationItems,
    ...buildPatientItems(input.patients),
    ...buildEventItems(input.events, input.patients),
    ...buildEmailItems(input.emails),
    ...buildNotificationItems(input.notifications),
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
