import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Inbox,
  Mail,
  UserRound,
} from "lucide-react"

import { findPatient, minutesAgo, mockPatients } from "@/data/patients"
import type { Notification, Patient } from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import { formatLocaleDate } from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"

type BuildNotificationsCtx = {
  t: TranslateFn
  locale: Locale
}

function sessionDayLabel(daysAgo: number, locale: Locale) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return formatLocaleDate(date, locale, {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
}

export function buildNotifications(
  patients: Patient[] = mockPatients,
  ctx: BuildNotificationsCtx
): Notification[] {
  const { t, locale } = ctx
  const gustavo = findPatient(patients, "10")
  const camila = findPatient(patients, "3")
  const rafael = findPatient(patients, "2")
  const thiago = findPatient(patients, "4")
  const beatriz = findPatient(patients, "9")
  const fernanda = findPatient(patients, "11")

  const notifications: Notification[] = []

  if (gustavo) {
    notifications.push({
      id: "1",
      icon: AlertCircle,
      category: "sessao",
      title: t("demo.notifications.1.title", { name: gustavo.name }),
      description: t("demo.notifications.1.description", {
        sessionDay: sessionDayLabel(2, locale),
        time: gustavo.sessionTime,
      }),
      date: minutesAgo(18),
      read: false,
    })
  }

  if (camila) {
    notifications.push({
      id: "2",
      icon: AlertCircle,
      category: "sessao",
      title: t("demo.notifications.2.title", { name: camila.name }),
      description: t("demo.notifications.2.description", {
        sessionDay: sessionDayLabel(1, locale),
        time: camila.sessionTime,
      }),
      date: minutesAgo(95),
      read: false,
    })
  }

  if (rafael) {
    notifications.push({
      id: "3",
      icon: CalendarClock,
      category: "sessao",
      title: t("demo.notifications.3.title", { name: rafael.name }),
      description: t("demo.notifications.3.description", {
        time: rafael.sessionTime,
      }),
      date: minutesAgo(210),
      read: false,
    })
  }

  if (thiago) {
    notifications.push({
      id: "4",
      icon: CreditCard,
      category: "financeiro",
      title: t("demo.notifications.4.title", { name: thiago.name }),
      description: t("demo.notifications.4.description"),
      date: minutesAgo(60 * 4),
      read: false,
    })
  }

  if (beatriz) {
    notifications.push({
      id: "5",
      icon: ClipboardList,
      category: "sessao",
      title: t("demo.notifications.5.title", { name: beatriz.name }),
      description: t("demo.notifications.5.description"),
      date: minutesAgo(60 * 26),
      read: true,
    })
  }

  notifications.push({
    id: "6",
    icon: AlertCircle,
    category: "sessao",
    title: t("demo.notifications.6.title"),
    description: t("demo.notifications.6.description"),
    date: minutesAgo(60 * 28),
    read: true,
  })

  if (fernanda) {
    notifications.push({
      id: "7",
      icon: UserRound,
      category: "paciente",
      title: t("demo.notifications.7.title", { name: fernanda.name }),
      description: t("demo.notifications.7.description"),
      date: minutesAgo(60 * 40),
      read: true,
    })
  }

  if (thiago) {
    notifications.push({
      id: "8",
      icon: UserRound,
      category: "paciente",
      title: t("demo.notifications.8.title", { name: thiago.name }),
      description: t("demo.notifications.8.description"),
      date: minutesAgo(60 * 52),
      read: true,
    })
  }

  notifications.push({
    id: "9",
    icon: CreditCard,
    category: "financeiro",
    title: t("demo.notifications.9.title"),
    description: t("demo.notifications.9.description"),
    date: minutesAgo(60 * 68),
    read: true,
  })

  notifications.push({
    id: "10",
    icon: Inbox,
    category: "mensagem",
    title: t("demo.notifications.10.title"),
    description: t("demo.notifications.10.description"),
    date: minutesAgo(60 * 80),
    read: true,
  })

  notifications.push({
    id: "11",
    icon: Mail,
    category: "sistema",
    title: t("demo.notifications.11.title"),
    description: t("demo.notifications.11.description"),
    date: minutesAgo(60 * 96),
    read: true,
  })

  return notifications
}
