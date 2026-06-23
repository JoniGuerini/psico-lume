import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { buildCalendarEvents } from "@/data/calendar"
import { buildClinicalRecords } from "@/data/clinical-records"
import { buildInboxEmails } from "@/data/inbox"
import { useTranslation } from "@/context/locale-provider"
import {
  formatNextSession,
  getActivePatients,
  getScheduledPatients,
  getTodaysAppointments,
  mockPatients,
  parsePrice,
} from "@/data/patients"
import type {
  CalendarEvent,
  InboxEmail,
  Notification,
  Patient,
  SessionNote,
  SessionStatus,
} from "@/data/types"
import {
  createEmptyGuestClinicSnapshot,
  createWelcomeNotification,
  loadGuestClinicSnapshot,
  saveGuestClinicSnapshot,
} from "@/lib/guest-clinic-storage"
import { buildClinicAlerts } from "@/lib/clinic-alerts"
import { isAlertEnabled } from "@/lib/notification-preferences"
import { useNotificationPreferences } from "@/context/notification-preferences-provider"
import {
  getEventStatus,
  mergeEventStatuses,
  resolveRescheduledFromAfterMove,
  resolveStatusAfterMove,
  syncStaleEventStatuses,
} from "@/lib/session-status"
import {
  buildUnpaidSessionRows,
  getOverdueSessionRows,
  isBillableSession,
  isPatientOverdue,
  resolveEventBilling,
} from "@/lib/session-payment"

type ClinicDataContextValue = {
  patients: Patient[]
  events: CalendarEvent[]
  notifications: Notification[]
  emails: InboxEmail[]
  sessionNotes: SessionNote[]
  activeCount: number
  scheduledCount: number
  todaysAppointments: Patient[]
  weekRevenue: number
  overduePatients: Patient[]
  overdueValue: number
  overdueSessionCount: number
  addPatient: (patient: Patient) => void
  updatePatient: (patient: Patient) => void
  setPatientPaymentOverdueManual: (
    patientId: string,
    manual: boolean | null
  ) => void
  addSessionNote: (note: SessionNote) => void
  updateSessionNote: (note: SessionNote) => void
  deleteSessionNote: (noteId: string) => void
  deletePatient: (patientId: string) => void
  addEvent: (event: CalendarEvent) => void
  moveEvent: (id: string, date: Date, startMinutes: number) => void
  updateEvent: (event: CalendarEvent) => void
  deleteEvent: (eventId: string) => void
  updateEventStatus: (id: string, status: SessionStatus) => void
  markEventPaid: (id: string, paid?: boolean) => void
  markAllEventsPaid: (ids: string[]) => void
  unpaidSessions: ReturnType<typeof buildUnpaidSessionRows>
  unpaidSessionsTotal: number
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const ClinicDataContext = createContext<ClinicDataContextValue | null>(null)

function minutesToTime(total: number) {
  const clamped = Math.max(0, Math.min(24 * 60, total))
  const hours = Math.floor(clamped / 60)
  const minutes = Math.round(clamped % 60)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function findPatientById(patients: Patient[], patientId: string | undefined) {
  if (!patientId) return undefined
  return patients.find((patient) => patient.id === patientId)
}

function maxSessionNumberFromNotes(
  patientId: string,
  notes: SessionNote[]
): number {
  return notes
    .filter((note) => note.patientId === patientId)
    .reduce((max, note) => Math.max(max, note.sessionNumber), 0)
}

function applyPatientSessionCountFromNotes(
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>,
  patientId: string,
  notes: SessionNote[]
) {
  const sessions = maxSessionNumberFromNotes(patientId, notes)
  setPatients((current) =>
    current.map((patient) =>
      patient.id === patientId ? { ...patient, sessions } : patient
    )
  )
}

function rebuildRecurringEvents(
  patients: Patient[],
  currentEvents: CalendarEvent[]
) {
  const manual = currentEvents.filter((event) => event.patientId === "")
  return syncStaleEventStatuses(
    mergeEventStatuses(currentEvents, [
      ...manual,
      ...buildCalendarEvents(patients),
    ]),
    patients
  )
}

function applySessionCountChange(
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>,
  patientId: string | undefined,
  previousStatus: SessionStatus | undefined,
  nextStatus: SessionStatus | undefined
) {
  if (!patientId) return

  const prev = previousStatus ?? "agendada"
  const next = nextStatus ?? "agendada"
  if (prev === next) return

  if (next === "realizada" && prev !== "realizada") {
    setPatients((patients) =>
      patients.map((patient) =>
        patient.id === patientId
          ? { ...patient, sessions: patient.sessions + 1 }
          : patient
      )
    )
  }

  if (prev === "realizada" && next !== "realizada") {
    setPatients((patients) =>
      patients.map((patient) =>
        patient.id === patientId
          ? { ...patient, sessions: Math.max(0, patient.sessions - 1) }
          : patient
      )
    )
  }
}

export type ClinicDataMode = "demo" | "guest"

function createDemoInitialState() {
  return {
    patients: mockPatients,
    sessionNotes: buildClinicalRecords(mockPatients),
    events: syncStaleEventStatuses(
      buildCalendarEvents(mockPatients),
      mockPatients
    ),
  }
}

function createGuestInitialState() {
  return loadGuestClinicSnapshot() ?? createEmptyGuestClinicSnapshot()
}

export function ClinicDataProvider({
  children,
  mode = "demo",
}: {
  children: React.ReactNode
  mode?: ClinicDataMode
}) {
  const { t, locale } = useTranslation()
  const { preferences: notificationPreferences } = useNotificationPreferences()
  const initialState = useMemo(
    () =>
      mode === "guest" ? createGuestInitialState() : createDemoInitialState(),
    [mode]
  )
  const [patients, setPatients] = useState<Patient[]>(initialState.patients)
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>(
    initialState.sessionNotes
  )
  const [events, setEvents] = useState<CalendarEvent[]>(initialState.events)
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    mode === "guest"
      ? (loadGuestClinicSnapshot()?.notifications ?? [])
      : []
  )
  const emails = useMemo(
    () => buildInboxEmails(patients, { t, locale }),
    [patients, t, locale]
  )

  useEffect(() => {
    if (mode !== "demo") return
    setNotifications((current) => {
      const readById = new Map(current.map((item) => [item.id, item.read]))
      return buildClinicAlerts({
        patients,
        events,
        sessionNotes,
        emails,
        t,
        locale,
      })
        .filter((item) => isAlertEnabled(item.id, notificationPreferences))
        .map((item) => ({
          ...item,
          read: readById.get(item.id) ?? item.read,
        }))
    })
  }, [mode, patients, events, sessionNotes, emails, t, locale, notificationPreferences])

  useEffect(() => {
    if (mode !== "guest") return
    setNotifications((current) => {
      const readById = new Map(current.map((item) => [item.id, item.read]))
      const welcome = {
        ...createWelcomeNotification(),
        read: readById.get("guest-welcome") ?? false,
      }
      const alerts = buildClinicAlerts({
        patients,
        events,
        sessionNotes,
        emails,
        t,
        locale,
      })
        .filter((item) => isAlertEnabled(item.id, notificationPreferences))
        .map((item) => ({
          ...item,
          read: readById.get(item.id) ?? false,
        }))
      const items = isAlertEnabled(welcome.id, notificationPreferences)
        ? [welcome, ...alerts]
        : alerts
      return items
    })
  }, [mode, patients, events, sessionNotes, emails, t, locale, notificationPreferences])

  useEffect(() => {
    if (mode !== "guest") return
    saveGuestClinicSnapshot({
      patients,
      events,
      sessionNotes,
      notifications,
    })
  }, [mode, patients, events, sessionNotes, notifications])

  const activeCount = useMemo(() => getActivePatients(patients).length, [patients])
  const scheduledCount = useMemo(
    () => getScheduledPatients(patients).length,
    [patients]
  )
  const todaysAppointments = useMemo(
    () => getTodaysAppointments(patients),
    [patients]
  )
  const weekRevenue = useMemo(
    () =>
      getScheduledPatients(patients).reduce(
        (sum, patient) => sum + parsePrice(patient.price),
        0
      ),
    [patients]
  )
  const overduePatients = useMemo(
    () => patients.filter((patient) => isPatientOverdue(patient, events)),
    [patients, events]
  )
  const overdueRows = useMemo(
    () => getOverdueSessionRows(events, patients),
    [events, patients]
  )
  const overdueValue = useMemo(
    () => overdueRows.reduce((sum, row) => sum + row.amount, 0),
    [overdueRows]
  )
  const overdueSessionCount = overdueRows.length
  const unpaidSessions = useMemo(
    () => buildUnpaidSessionRows(events, patients),
    [events, patients]
  )
  const unpaidSessionsTotal = useMemo(
    () => unpaidSessions.reduce((sum, row) => sum + row.amount, 0),
    [unpaidSessions]
  )

  const value = useMemo<ClinicDataContextValue>(
    () => ({
      patients,
      events,
      notifications,
      emails,
      sessionNotes,
      activeCount,
      scheduledCount,
      todaysAppointments,
      weekRevenue,
      overduePatients,
      overdueValue,
      overdueSessionCount,
      unpaidSessions,
      unpaidSessionsTotal,
      addPatient: (patient) => {
        setPatients((current) => {
          const next = [patient, ...current]
          setEvents((events) => rebuildRecurringEvents(next, events))
          return next
        })
      },
      updatePatient: (patient) => {
        setPatients((current) => {
          const next = current.map((item) =>
            item.id === patient.id ? patient : item
          )
          setEvents((events) => rebuildRecurringEvents(next, events))
          return next
        })
      },
      setPatientPaymentOverdueManual: (patientId, manual) => {
        setPatients((current) =>
          current.map((item) =>
            item.id === patientId
              ? { ...item, paymentOverdueManual: manual }
              : item
          )
        )
      },
      addSessionNote: (note) => {
        setSessionNotes((current) => {
          const next = [note, ...current]
          applyPatientSessionCountFromNotes(setPatients, note.patientId, next)
          return next
        })
      },
      updateSessionNote: (updated) => {
        setSessionNotes((current) => {
          const next = current.map((note) =>
            note.id === updated.id ? updated : note
          )
          applyPatientSessionCountFromNotes(
            setPatients,
            updated.patientId,
            next
          )
          return next
        })
      },
      deleteSessionNote: (noteId) => {
        const target = sessionNotes.find((note) => note.id === noteId)

        setSessionNotes((current) => {
          const next = current.filter((note) => note.id !== noteId)
          if (target) {
            applyPatientSessionCountFromNotes(
              setPatients,
              target.patientId,
              next
            )
          }
          return next
        })
      },
      deletePatient: (patientId) => {
        setPatients((current) => {
          const next = current.filter((item) => item.id !== patientId)
          setSessionNotes((notes) =>
            notes.filter((note) => note.patientId !== patientId)
          )
          setEvents((events) => {
            const withoutPatient = events.filter(
              (event) => event.patientId !== patientId
            )
            return rebuildRecurringEvents(next, withoutPatient)
          })
          return next
        })
      },
      addEvent: (event) => {
        const patient = findPatientById(patients, event.patientId)
        const status = event.status ?? "agendada"
        const amount =
          event.amount ??
          (patient ? parsePrice(patient.price) : undefined)

        setEvents((current) => [
          ...current,
          {
            ...event,
            status,
            amount,
          },
        ])
      },
      moveEvent: (id, date, startMinutes) => {
        const previous = events.find((event) => event.id === id)
        if (!previous) return

        const durationMin = Math.max(
          toMinutes(previous.end) - toMinutes(previous.start),
          30
        )
        const currentStatus = getEventStatus(previous)
        const nextStatus = resolveStatusAfterMove(currentStatus)
        const rescheduledFrom = resolveRescheduledFromAfterMove(
          previous,
          currentStatus,
          nextStatus
        )
        const patient = findPatientById(patients, previous.patientId)
        const nextStart = minutesToTime(startMinutes)
        const nextEnd = minutesToTime(startMinutes + durationMin)
        const billing = resolveEventBilling(
          previous,
          {
            date,
            start: nextStart,
            end: nextEnd,
            status: nextStatus,
            rescheduledFrom,
          },
          patient
        )

        setEvents((current) =>
          current.map((event) => {
            if (event.id !== id) return event
            return {
              ...event,
              date,
              start: nextStart,
              end: nextEnd,
              status: nextStatus,
              rescheduledFrom,
              ...billing,
            }
          })
        )
      },
      updateEvent: (updated) => {
        const previous = events.find((event) => event.id === updated.id)
        if (!previous) return

        const patient = findPatientById(
          patients,
          updated.patientId || previous.patientId
        )
        const billing = resolveEventBilling(previous, updated, patient)
        const merged: CalendarEvent = {
          ...updated,
          ...billing,
          rescheduledFrom:
            getEventStatus(updated) === "remarcada"
              ? updated.rescheduledFrom ?? previous.rescheduledFrom
              : undefined,
        }

        setEvents((current) => {
          applySessionCountChange(
            setPatients,
            updated.patientId || previous.patientId,
            previous.status,
            updated.status
          )

          return current.map((event) =>
            event.id === updated.id ? merged : event
          )
        })
      },
      deleteEvent: (eventId) => {
        const previous = events.find((event) => event.id === eventId)
        if (!previous) return

        setEvents((current) => current.filter((event) => event.id !== eventId))

        if (previous.status === "realizada") {
          applySessionCountChange(
            setPatients,
            previous.patientId,
            "realizada",
            "agendada"
          )
        }
      },
      updateEventStatus: (id, status) => {
        const previous = events.find((event) => event.id === id)
        if (!previous || previous.status === status) return

        const patient = findPatientById(patients, previous.patientId)
        const billing = resolveEventBilling(previous, { status }, patient)
        const merged: CalendarEvent = {
          ...previous,
          status,
          ...billing,
        }

        setEvents((current) => {
          applySessionCountChange(
            setPatients,
            previous.patientId,
            previous.status,
            status
          )

          return current.map((event) => (event.id === id ? merged : event))
        })
      },
      markEventPaid: (id, paid = true) => {
        const previous = events.find((event) => event.id === id)
        if (!previous || !isBillableSession(previous) || previous.paid === paid) {
          return
        }

        setEvents((current) =>
          current.map((event) => (event.id === id ? { ...event, paid } : event))
        )
      },
      markAllEventsPaid: (ids) => {
        const idSet = new Set(ids)
        const targets = events.filter(
          (event) =>
            idSet.has(event.id) && isBillableSession(event) && !event.paid
        )
        if (targets.length === 0) return

        setEvents((current) =>
          current.map((event) =>
            idSet.has(event.id) && isBillableSession(event)
              ? { ...event, paid: true }
              : event
          )
        )
      },
      markNotificationAsRead: (id) =>
        setNotifications((current) =>
          current.map((item) =>
            item.id === id ? { ...item, read: true } : item
          )
        ),
      markAllNotificationsAsRead: () =>
        setNotifications((current) =>
          current.map((item) => ({ ...item, read: true }))
        ),
      removeNotification: (id) =>
        setNotifications((current) => current.filter((item) => item.id !== id)),
      clearNotifications: () => setNotifications([]),
    }),
    [
      patients,
      events,
      notifications,
      emails,
      sessionNotes,
      activeCount,
      scheduledCount,
      todaysAppointments,
      weekRevenue,
      overduePatients,
      overdueValue,
      overdueSessionCount,
      unpaidSessions,
      unpaidSessionsTotal,
    ]
  )

  return (
    <ClinicDataContext.Provider value={value}>
      {children}
    </ClinicDataContext.Provider>
  )
}

export function useClinicData() {
  const context = useContext(ClinicDataContext)
  if (!context) {
    throw new Error("useClinicData deve ser usado dentro de ClinicDataProvider")
  }
  return context
}

export { formatNextSession }
