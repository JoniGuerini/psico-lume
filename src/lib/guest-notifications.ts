import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  Trash2,
  UserRound,
} from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import type {
  CalendarEvent,
  Notification,
  NotificationCategory,
  Patient,
  PatientModality,
  PatientStatus,
  SessionNote,
  SessionStatus,
} from "@/data/types"
import { sessionStatusConfig } from "@/lib/session-status"
import type { ToastVariant } from "@/lib/toast-preferences"

const MAX_GUEST_NOTIFICATIONS = 50

const statusLabels: Record<PatientStatus, string> = {
  ativo: "Ativo",
  "em-pausa": "Em pausa",
  "lista-espera": "Lista de espera",
  alta: "Alta",
}

const modalityLabels: Record<PatientModality, string> = {
  presencial: "Presencial",
  online: "Remoto",
  hibrido: "Híbrido",
}

export type ToastEmitter = (
  title: string,
  options?: {
    description?: string
    variant?: ToastVariant
    duration?: number
  }
) => void

function formatSessionDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
}

function formatEventSlot(event: Pick<CalendarEvent, "date" | "start" | "end">) {
  return `${formatSessionDate(event.date)} · ${event.start}–${event.end}`
}

function truncate(text: string, max: number) {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function baseNotification(
  partial: Omit<Notification, "id" | "date" | "read">
): Notification {
  return {
    id: crypto.randomUUID(),
    date: new Date(),
    read: false,
    ...partial,
  }
}

export function notificationToastVariant(
  category: NotificationCategory
): ToastVariant {
  switch (category) {
    case "financeiro":
      return "info"
    case "mensagem":
    case "sistema":
      return "info"
    default:
      return "success"
  }
}

export function notificationForNewPatient(patient: Patient): Notification {
  const details = [
    statusLabels[patient.status],
    modalityLabels[patient.modality],
    patient.patientType,
  ].filter(Boolean)

  let description = details.join(" · ")

  if (patient.complaint && patient.complaint !== "—") {
    description += `. Queixa: ${truncate(patient.complaint, 56)}`
  }

  if (patient.sessionDay && patient.sessionTime) {
    description += `. Horário recorrente: ${patient.sessionDay} às ${patient.sessionTime}`
  }

  if (patient.price) {
    description += `. Valor: R$ ${patient.price}`
  }

  description += ". Próximo passo: agendar a primeira sessão ou registrar a entrevista."

  return baseNotification({
    icon: UserRound,
    category: "paciente",
    title: `Paciente cadastrado — ${patient.name}`,
    description,
  })
}

export function notificationForUpdatedPatient(patient: Patient): Notification {
  const details = [
    statusLabels[patient.status],
    modalityLabels[patient.modality],
    patient.price ? `R$ ${patient.price}` : null,
    patient.nextSession ? `Próxima: ${patient.nextSession}` : null,
  ].filter(Boolean)

  return baseNotification({
    icon: UserRound,
    category: "paciente",
    title: `Paciente atualizado — ${patient.name}`,
    description: `${details.join(" · ")}. Cadastro e agenda recorrente sincronizados.`,
  })
}

export function notificationForDeletedPatient(patient: Patient): Notification {
  return baseNotification({
    icon: Trash2,
    category: "sistema",
    title: `Paciente removido — ${patient.name}`,
    description:
      "Cadastro, prontuário, sessões agendadas e registros financeiros deste paciente foram excluídos permanentemente.",
  })
}

export function notificationForScheduledSession(
  patient: Patient,
  event: Pick<CalendarEvent, "date" | "start" | "end" | "title">
): Notification {
  const details = [
    formatEventSlot(event),
    modalityLabels[patient.modality],
    patient.price ? `R$ ${patient.price}` : null,
  ].filter(Boolean)

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: `Sessão agendada — ${patient.name}`,
    description: `${details.join(" · ")}. Status: agendada. Veja na agenda semanal ou no perfil.`,
  })
}

export function notificationForUpdatedSession(
  patient: Patient,
  event: CalendarEvent,
  previous: CalendarEvent
): Notification {
  const status = event.status ?? "agendada"
  const previousStatus = previous.status ?? "agendada"
  const changes: string[] = []

  if (previous.date.getTime() !== event.date.getTime()) {
    changes.push(
      `Data: ${formatSessionDate(previous.date)} → ${formatSessionDate(event.date)}`
    )
  }
  if (previous.start !== event.start || previous.end !== event.end) {
    changes.push(
      `Horário: ${previous.start}–${previous.end} → ${event.start}–${event.end}`
    )
  }
  if (previousStatus !== status) {
    changes.push(
      `Status: ${sessionStatusConfig[previousStatus].label} → ${sessionStatusConfig[status].label}`
    )
  }

  const changeText =
    changes.length > 0
      ? changes.join(". ")
      : "Detalhes da sessão foram atualizados."

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: `Sessão atualizada — ${patient.name}`,
    description: `${formatEventSlot(event)}. ${changeText}`,
  })
}

export function notificationForMovedSession(
  patient: Patient,
  previous: CalendarEvent,
  next: Pick<CalendarEvent, "date" | "start" | "end" | "status">
): Notification {
  const status = next.status ?? "remarcada"

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: `Sessão remarcada — ${patient.name}`,
    description: `De ${formatEventSlot(previous)} para ${formatSessionDate(next.date)} · ${next.start}–${next.end}. Status: ${sessionStatusConfig[status].label}.`,
  })
}

export function notificationForSessionStatusChange(
  patient: Patient,
  event: CalendarEvent,
  status: SessionStatus,
  previousStatus: SessionStatus
): Notification {
  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: `Status da sessão — ${patient.name}`,
    description: `${formatEventSlot(event)}. ${sessionStatusConfig[previousStatus].label} → ${sessionStatusConfig[status].label}. Financeiro e histórico atualizados.`,
  })
}

export function notificationForSessionNote(
  patient: Patient,
  note: SessionNote
): Notification {
  return baseNotification({
    icon: ClipboardList,
    category: "sessao",
    title: `Evolução registrada — ${patient.name}`,
    description: buildSessionNoteDescription(note),
  })
}

export function notificationForUpdatedSessionNote(
  patient: Patient,
  note: SessionNote
): Notification {
  return baseNotification({
    icon: ClipboardList,
    category: "sessao",
    title: `Evolução atualizada — ${patient.name}`,
    description: buildSessionNoteDescription(note),
  })
}

export function notificationForDeletedSession(
  patient: Patient,
  event: CalendarEvent
): Notification {
  const status = event.status ?? "agendada"
  const statusLabel = sessionStatusConfig[status]?.label ?? status
  const paidNote =
    event.paid === true
      ? " Pagamento registrado nesta sessão também foi removido."
      : ""

  return baseNotification({
    icon: Trash2,
    category: "sessao",
    title: `Sessão excluída — ${patient.name}`,
    description: `${formatEventSlot(event)} · ${statusLabel} removida da agenda.${paidNote}`,
  })
}

export function notificationForDeletedSessionNote(
  patient: Patient,
  note: SessionNote
): Notification {
  return baseNotification({
    icon: Trash2,
    category: "sessao",
    title: `Evolução removida — ${patient.name}`,
    description: `${note.date} · ${note.sessionNumber}ª sessão. Removido: ${truncate(note.summary, 72)}.`,
  })
}

function buildSessionNoteDescription(note: SessionNote) {
  const parts = [
    note.date,
    `${note.sessionNumber}ª sessão`,
    note.mood,
    note.modality ? modalityLabels[note.modality] : null,
  ].filter(Boolean)

  let description = parts.join(" · ")
  description += `. ${truncate(note.summary, 72)}`

  if (note.plan) {
    description += ` Plano: ${truncate(note.plan, 48)}.`
  }

  if (note.tags?.length) {
    description += ` Tags: ${note.tags.slice(0, 4).join(", ")}.`
  }

  return description
}

export function notificationForEventPayment(
  patient: Patient,
  event: CalendarEvent,
  paid: boolean
): Notification {
  const amount = event.amount ?? 0

  return baseNotification({
    icon: CreditCard,
    category: "financeiro",
    title: paid
      ? `Pagamento registrado — ${patient.name}`
      : `Pagamento revertido — ${patient.name}`,
    description: `${formatEventSlot(event)} · ${formatBrl(amount)}. ${
      paid
        ? "Receita atualizada no financeiro e na aba A receber."
        : "Sessão voltou para pendente de pagamento."
    }`,
  })
}

export function notificationForBulkEventPayment(
  count: number,
  total: number
): Notification {
  return baseNotification({
    icon: CreditCard,
    category: "financeiro",
    title: `${count} sessões marcadas como pagas`,
    description: `Total de ${formatBrl(total)} registrado no financeiro.`,
  })
}

export function notificationForPaymentOverdueOverride(
  patient: Patient,
  manual: boolean | null
): Notification {
  const label =
    manual === true
      ? "Inadimplente (manual)"
      : manual === false
        ? "Em dia (manual)"
        : "Automático (por sessões)"

  return baseNotification({
    icon: CreditCard,
    category: "financeiro",
    title: `Inadimplência — ${patient.name}`,
    description: `Status definido como ${label}. O financeiro e os alertas passam a usar essa regra.`,
  })
}

export function prependGuestNotification(
  notifications: Notification[],
  notification: Notification
): Notification[] {
  return [notification, ...notifications].slice(0, MAX_GUEST_NOTIFICATIONS)
}

export function emitGuestNotification(
  mode: "demo" | "guest",
  setNotifications: Dispatch<SetStateAction<Notification[]>>,
  toast: ToastEmitter,
  notification: Notification
) {
  if (mode !== "guest") return

  setNotifications((current) => prependGuestNotification(current, notification))

  toast(notification.title, {
    description: notification.description,
    variant: notificationToastVariant(notification.category),
    duration: 4500,
  })
}
