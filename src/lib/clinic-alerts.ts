import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Inbox,
  Mail,
  UserRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type {
  CalendarEvent,
  InboxEmail,
  Notification,
  NotificationCategory,
  Patient,
  SessionNote,
} from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import { formatLocaleCurrency, formatLocaleDate } from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"
import {
  getOverdueSessionRows,
  getSessionAmount,
  isBillableSession,
  isSessionUnpaid,
} from "@/lib/session-payment"
import { getEventStatus } from "@/lib/session-status"

export type ClinicAlertsContext = {
  patients: Patient[]
  events: CalendarEvent[]
  sessionNotes: SessionNote[]
  emails: InboxEmail[]
  t: TranslateFn
  locale: Locale
}

const MAX_PENDING_STATUS = 5
const MAX_TODAY = 5
const MAX_OVERDUE = 5
const MAX_EVOLUTION = 5
const MAX_PATIENT_STATUS = 5

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function sessionEndDate(event: CalendarEvent) {
  const end = new Date(event.date)
  const [hours, minutes] = event.end.split(":").map(Number)
  end.setHours(hours, minutes, 0, 0)
  return end
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

function formatSessionDay(date: Date, locale: Locale) {
  const label = formatLocaleDate(date, locale, {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function noteMatchesEvent(note: SessionNote, event: CalendarEvent, locale: Locale) {
  if (note.patientId !== event.patientId) return false
  const eventDate = formatLocaleDate(event.date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  return note.date === eventDate
}

function alertBase(
  id: string,
  category: NotificationCategory,
  icon: LucideIcon,
  title: string,
  description: string,
  date: Date
): Notification {
  return {
    id,
    category,
    icon,
    title,
    description,
    date,
    read: false,
  }
}

export function buildClinicAlerts(ctx: ClinicAlertsContext): Notification[] {
  const { patients, events, sessionNotes, emails, t, locale } = ctx
  const now = new Date()
  const todayStart = startOfDay(now)
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))
  const alerts: Notification[] = []

  const pendingStatus = events
    .filter((event) => {
      if (!event.patientId) return false
      if (getEventStatus(event) !== "agendada") return false
      return sessionEndDate(event) < now
    })
    .sort((a, b) => sessionEndDate(b).getTime() - sessionEndDate(a).getTime())

  const weekAgo = new Date(todayStart)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const unclosedWeek = pendingStatus.filter(
    (event) => startOfDay(event.date) >= weekAgo
  )

  if (unclosedWeek.length >= 3) {
    alerts.push(
      alertBase(
        "alert-unclosed-week",
        "sessao",
        AlertCircle,
        t("alerts.unclosedWeek.title", { count: unclosedWeek.length }),
        t("alerts.unclosedWeek.description"),
        now
      )
    )
  } else {
    for (const event of pendingStatus.slice(0, MAX_PENDING_STATUS)) {
      const patient = patientById.get(event.patientId)
      if (!patient) continue

      alerts.push(
        alertBase(
          `alert-pending-status-${event.id}`,
          "sessao",
          AlertCircle,
          t("alerts.pendingStatus.title", { name: patient.name }),
          t("alerts.pendingStatus.description", {
            sessionDay: formatSessionDay(event.date, locale),
            time: event.start,
          }),
          sessionEndDate(event)
        )
      )
    }
  }

  const todaySessions = events
    .filter((event) => {
      if (!event.patientId) return false
      if (!isSameDay(event.date, now)) return false
      return getEventStatus(event) === "agendada"
    })
    .sort((a, b) => a.start.localeCompare(b.start))

  for (const event of todaySessions.slice(0, MAX_TODAY)) {
    const patient = patientById.get(event.patientId)
    if (!patient) continue

    alerts.push(
      alertBase(
        `alert-today-${event.id}`,
        "sessao",
        CalendarClock,
        t("alerts.todaySession.title", { name: patient.name }),
        t("alerts.todaySession.description", { time: event.start }),
        event.date
      )
    )
  }

  const overdueRows = getOverdueSessionRows(events, patients, now)
  const overdueByPatient = new Map<string, typeof overdueRows>()
  for (const row of overdueRows) {
    const list = overdueByPatient.get(row.patient.id) ?? []
    list.push(row)
    overdueByPatient.set(row.patient.id, list)
  }

  for (const [patientId, rows] of Array.from(overdueByPatient.entries()).slice(
    0,
    MAX_OVERDUE
  )) {
    const patient = patientById.get(patientId)
    if (!patient) continue
    const total = rows.reduce((sum, row) => sum + row.amount, 0)

    alerts.push(
      alertBase(
        `alert-overdue-${patientId}`,
        "financeiro",
        CreditCard,
        t("alerts.overduePayment.title", { name: patient.name }),
        t("alerts.overduePayment.description", {
          count: rows.length,
          total: formatLocaleCurrency(total, locale),
        }),
        rows[0]?.event.date ?? now
      )
    )
  }

  const pendingEvolution = events
    .filter((event) => {
      if (!event.patientId) return false
      if (getEventStatus(event) !== "realizada") return false
      if (sessionEndDate(event) > now) return false
      return !sessionNotes.some((note) => noteMatchesEvent(note, event, locale))
    })
    .sort((a, b) => sessionEndDate(b).getTime() - sessionEndDate(a).getTime())

  for (const event of pendingEvolution.slice(0, MAX_EVOLUTION)) {
    const patient = patientById.get(event.patientId)
    if (!patient) continue

    alerts.push(
      alertBase(
        `alert-evolution-${event.id}`,
        "sessao",
        ClipboardList,
        t("alerts.pendingEvolution.title", { name: patient.name }),
        t("alerts.pendingEvolution.description", {
          sessionDay: formatSessionDay(event.date, locale),
        }),
        sessionEndDate(event)
      )
    )
  }

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - ((now.getDay() + 6) % 7))
  const billableThisWeek = events.filter((event) => {
    if (!isBillableSession(event)) return false
    if (!isSessionUnpaid(event)) return false
    return startOfDay(event.date) >= weekStart && startOfDay(event.date) <= todayStart
  })

  if (billableThisWeek.length >= 3) {
    const total = billableThisWeek.reduce(
      (sum, event) =>
        sum + getSessionAmount(event, patientById.get(event.patientId ?? "")),
      0
    )
    alerts.push(
      alertBase(
        "alert-unpaid-week",
        "financeiro",
        CreditCard,
        t("alerts.unpaidWeek.title", { count: billableThisWeek.length }),
        t("alerts.unpaidWeek.description", {
          count: billableThisWeek.length,
          total: formatLocaleCurrency(total, locale),
        }),
        now
      )
    )
  }

  const waitlist = patients
    .filter((patient) => patient.status === "lista-espera")
    .slice(0, MAX_PATIENT_STATUS)

  for (const patient of waitlist) {
    alerts.push(
      alertBase(
        `alert-waitlist-${patient.id}`,
        "paciente",
        UserRound,
        t("alerts.waitlist.title", { name: patient.name }),
        t("alerts.waitlist.description"),
        now
      )
    )
  }

  const paused = patients
    .filter((patient) => patient.status === "em-pausa")
    .slice(0, MAX_PATIENT_STATUS)

  for (const patient of paused) {
    alerts.push(
      alertBase(
        `alert-paused-${patient.id}`,
        "paciente",
        UserRound,
        t("alerts.pausedPatient.title", { name: patient.name }),
        t("alerts.pausedPatient.description"),
        now
      )
    )
  }

  const unreadEmails = emails.filter((email) => !email.read)
  if (unreadEmails.length > 0) {
    alerts.push(
      alertBase(
        "alert-inbox-unread",
        "mensagem",
        Inbox,
        t("alerts.inboxUnread.title", { count: unreadEmails.length }),
        t("alerts.inboxUnread.description", { count: unreadEmails.length }),
        now
      )
    )
  }

  if (patients.length > 0 && events.length > 0) {
    alerts.push(
      alertBase(
        "alert-weekly-summary",
        "sistema",
        Mail,
        t("alerts.weeklySummary.title"),
        t("alerts.weeklySummary.description"),
        now
      )
    )
  }

  return alerts.sort((a, b) => b.date.getTime() - a.date.getTime())
}
