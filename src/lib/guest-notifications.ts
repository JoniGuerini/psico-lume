import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  Trash2,
  UserRound,
} from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import { parsePrice } from "@/data/patients"
import type {
  CalendarEvent,
  Notification,
  NotificationCategory,
  Patient,
  SessionNote,
  SessionStatus,
} from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import {
  formatLocaleCurrency,
  formatLocaleDate,
  getModalityLabel,
  getPatientStatusLabel,
  getSessionStatusLabel,
} from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"
import type { ToastVariant } from "@/lib/toast-preferences"

const MAX_GUEST_NOTIFICATIONS = 50

export type GuestNotificationCtx = {
  t: TranslateFn
  locale: Locale
}

export type ToastEmitter = (
  title: string,
  options?: {
    description?: string
    variant?: ToastVariant
    duration?: number
  }
) => void

function formatSessionDate(date: Date, locale: Locale) {
  return formatLocaleDate(date, locale, {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
}

function formatEventSlot(
  event: Pick<CalendarEvent, "date" | "start" | "end">,
  locale: Locale
) {
  return `${formatSessionDate(event.date, locale)} · ${event.start}–${event.end}`
}

function truncate(text: string, max: number) {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function formatPatientPrice(price: string, locale: Locale) {
  return formatLocaleCurrency(parsePrice(price), locale)
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

export function notificationForNewPatient(
  patient: Patient,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const details = [
    getPatientStatusLabel(t, patient.status),
    getModalityLabel(t, patient.modality),
    patient.patientType,
  ].filter(Boolean)

  let description = details.join(" · ")

  if (patient.complaint && patient.complaint !== "—") {
    description += `. ${t("guestNotifications.newPatient.complaint", {
      complaint: truncate(patient.complaint, 56),
    })}`
  }

  if (patient.sessionDay && patient.sessionTime) {
    description += `. ${t("guestNotifications.newPatient.recurringSlot", {
      day: patient.sessionDay,
      time: patient.sessionTime,
    })}`
  }

  if (patient.price) {
    description += `. ${t("guestNotifications.newPatient.price", {
      price: formatPatientPrice(patient.price, locale),
    })}`
  }

  description += `. ${t("guestNotifications.newPatient.nextStep")}`

  return baseNotification({
    icon: UserRound,
    category: "paciente",
    title: t("guestNotifications.newPatient.title", { name: patient.name }),
    description,
  })
}

export function notificationForUpdatedPatient(
  patient: Patient,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const details = [
    getPatientStatusLabel(t, patient.status),
    getModalityLabel(t, patient.modality),
    patient.price ? formatPatientPrice(patient.price, locale) : null,
    patient.nextSession
      ? t("guestNotifications.common.nextSession", { date: patient.nextSession })
      : null,
  ].filter(Boolean)

  return baseNotification({
    icon: UserRound,
    category: "paciente",
    title: t("guestNotifications.updatedPatient.title", { name: patient.name }),
    description: t("guestNotifications.updatedPatient.description", {
      details: details.join(" · "),
    }),
  })
}

export function notificationForDeletedPatient(
  patient: Patient,
  ctx: GuestNotificationCtx
): Notification {
  const { t } = ctx

  return baseNotification({
    icon: Trash2,
    category: "sistema",
    title: t("guestNotifications.deletedPatient.title", { name: patient.name }),
    description: t("guestNotifications.deletedPatient.description"),
  })
}

export function notificationForScheduledSession(
  patient: Patient,
  event: Pick<CalendarEvent, "date" | "start" | "end" | "title">,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const details = [
    formatEventSlot(event, locale),
    getModalityLabel(t, patient.modality),
    patient.price ? formatPatientPrice(patient.price, locale) : null,
  ].filter(Boolean)

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: t("guestNotifications.scheduledSession.title", { name: patient.name }),
    description: t("guestNotifications.scheduledSession.description", {
      details: details.join(" · "),
      status: getSessionStatusLabel(t, "agendada"),
    }),
  })
}

export function notificationForUpdatedSession(
  patient: Patient,
  event: CalendarEvent,
  previous: CalendarEvent,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const status = event.status ?? "agendada"
  const previousStatus = previous.status ?? "agendada"
  const changes: string[] = []

  if (previous.date.getTime() !== event.date.getTime()) {
    changes.push(
      t("guestNotifications.updatedSession.changeDate", {
        from: formatSessionDate(previous.date, locale),
        to: formatSessionDate(event.date, locale),
      })
    )
  }
  if (previous.start !== event.start || previous.end !== event.end) {
    changes.push(
      t("guestNotifications.updatedSession.changeTime", {
        from: `${previous.start}–${previous.end}`,
        to: `${event.start}–${event.end}`,
      })
    )
  }
  if (previousStatus !== status) {
    changes.push(
      t("guestNotifications.updatedSession.changeStatus", {
        from: getSessionStatusLabel(t, previousStatus),
        to: getSessionStatusLabel(t, status),
      })
    )
  }

  const changeText =
    changes.length > 0
      ? changes.join(". ")
      : t("guestNotifications.updatedSession.noChanges")

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: t("guestNotifications.updatedSession.title", { name: patient.name }),
    description: t("guestNotifications.updatedSession.description", {
      slot: formatEventSlot(event, locale),
      changes: changeText,
    }),
  })
}

export function notificationForMovedSession(
  patient: Patient,
  previous: CalendarEvent,
  next: Pick<CalendarEvent, "date" | "start" | "end" | "status">,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const status = next.status ?? "remarcada"

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: t("guestNotifications.movedSession.title", { name: patient.name }),
    description: t("guestNotifications.movedSession.description", {
      from: formatEventSlot(previous, locale),
      to: formatEventSlot(next, locale),
      status: getSessionStatusLabel(t, status),
    }),
  })
}

export function notificationForSessionStatusChange(
  patient: Patient,
  event: CalendarEvent,
  status: SessionStatus,
  previousStatus: SessionStatus,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx

  return baseNotification({
    icon: CalendarClock,
    category: "sessao",
    title: t("guestNotifications.sessionStatusChange.title", {
      name: patient.name,
    }),
    description: t("guestNotifications.sessionStatusChange.description", {
      slot: formatEventSlot(event, locale),
      from: getSessionStatusLabel(t, previousStatus),
      to: getSessionStatusLabel(t, status),
    }),
  })
}

export function notificationForSessionNote(
  patient: Patient,
  note: SessionNote,
  ctx: GuestNotificationCtx
): Notification {
  const { t } = ctx

  return baseNotification({
    icon: ClipboardList,
    category: "sessao",
    title: t("guestNotifications.sessionNote.titleRegistered", {
      name: patient.name,
    }),
    description: buildSessionNoteDescription(note, ctx),
  })
}

export function notificationForUpdatedSessionNote(
  patient: Patient,
  note: SessionNote,
  ctx: GuestNotificationCtx
): Notification {
  const { t } = ctx

  return baseNotification({
    icon: ClipboardList,
    category: "sessao",
    title: t("guestNotifications.sessionNote.titleUpdated", {
      name: patient.name,
    }),
    description: buildSessionNoteDescription(note, ctx),
  })
}

export function notificationForDeletedSession(
  patient: Patient,
  event: CalendarEvent,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const status = event.status ?? "agendada"
  const statusLabel = getSessionStatusLabel(t, status)
  const paidNote =
    event.paid === true
      ? t("guestNotifications.deletedSession.paidNoteRemoved")
      : ""

  return baseNotification({
    icon: Trash2,
    category: "sessao",
    title: t("guestNotifications.deletedSession.title", { name: patient.name }),
    description: t("guestNotifications.deletedSession.description", {
      slot: formatEventSlot(event, locale),
      status: statusLabel,
      paidNote,
    }),
  })
}

export function notificationForDeletedSessionNote(
  patient: Patient,
  note: SessionNote,
  ctx: GuestNotificationCtx
): Notification {
  const { t } = ctx

  return baseNotification({
    icon: Trash2,
    category: "sessao",
    title: t("guestNotifications.deletedSessionNote.title", {
      name: patient.name,
    }),
    description: t("guestNotifications.deletedSessionNote.description", {
      date: note.date,
      session: t("guestNotifications.sessionNote.sessionOrdinal", {
        count: note.sessionNumber,
      }),
      summary: truncate(note.summary, 72),
    }),
  })
}

function buildSessionNoteDescription(note: SessionNote, ctx: GuestNotificationCtx) {
  const { t } = ctx
  const parts = [
    note.date,
    t("guestNotifications.sessionNote.sessionOrdinal", {
      count: note.sessionNumber,
    }),
    note.mood,
    note.modality ? getModalityLabel(t, note.modality) : null,
  ].filter(Boolean)

  let description = parts.join(" · ")
  description += `. ${truncate(note.summary, 72)}`

  if (note.plan) {
    description += t("guestNotifications.sessionNote.plan", {
      plan: truncate(note.plan, 48),
    })
  }

  if (note.tags?.length) {
    description += t("guestNotifications.sessionNote.tags", {
      tags: note.tags.slice(0, 4).join(", "),
    })
  }

  return description
}

export function notificationForEventPayment(
  patient: Patient,
  event: CalendarEvent,
  paid: boolean,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx
  const amount = event.amount ?? 0
  const slot = formatEventSlot(event, locale)
  const formattedAmount = formatLocaleCurrency(amount, locale)

  return baseNotification({
    icon: CreditCard,
    category: "financeiro",
    title: paid
      ? t("guestNotifications.eventPayment.titlePaid", { name: patient.name })
      : t("guestNotifications.eventPayment.titleReverted", {
          name: patient.name,
        }),
    description: paid
      ? t("guestNotifications.eventPayment.descriptionPaid", {
          slot,
          amount: formattedAmount,
        })
      : t("guestNotifications.eventPayment.descriptionReverted", {
          slot,
          amount: formattedAmount,
        }),
  })
}

export function notificationForBulkEventPayment(
  count: number,
  total: number,
  ctx: GuestNotificationCtx
): Notification {
  const { t, locale } = ctx

  return baseNotification({
    icon: CreditCard,
    category: "financeiro",
    title: t("guestNotifications.bulkEventPayment.title", { count }),
    description: t("guestNotifications.bulkEventPayment.description", {
      total: formatLocaleCurrency(total, locale),
    }),
  })
}

export function notificationForPaymentOverdueOverride(
  patient: Patient,
  manual: boolean | null,
  ctx: GuestNotificationCtx
): Notification {
  const { t } = ctx
  const label =
    manual === true
      ? t("guestNotifications.paymentOverdueOverride.labelOverdue")
      : manual === false
        ? t("guestNotifications.paymentOverdueOverride.labelCurrent")
        : t("guestNotifications.paymentOverdueOverride.labelAuto")

  return baseNotification({
    icon: CreditCard,
    category: "financeiro",
    title: t("guestNotifications.paymentOverdueOverride.title", {
      name: patient.name,
    }),
    description: t("guestNotifications.paymentOverdueOverride.description", {
      label,
    }),
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
