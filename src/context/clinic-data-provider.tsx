import { createContext, useContext, useMemo, useState } from "react"

import { buildCalendarEvents } from "@/data/calendar"
import { buildClinicalRecords } from "@/data/clinical-records"
import { buildInboxEmails } from "@/data/inbox"
import { buildNotifications } from "@/data/notifications"
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
  getEventStatus,
  mergeEventStatuses,
  resolveRescheduledFromAfterMove,
  resolveStatusAfterMove,
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
  addEvent: (event: CalendarEvent) => void
  moveEvent: (id: string, date: Date, startMinutes: number) => void
  updateEvent: (event: CalendarEvent) => void
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

function rebuildRecurringEvents(
  patients: Patient[],
  currentEvents: CalendarEvent[]
) {
  const manual = currentEvents.filter((event) => event.patientId === "")
  return mergeEventStatuses(currentEvents, [
    ...manual,
    ...buildCalendarEvents(patients),
  ])
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

export function ClinicDataProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>(() =>
    buildClinicalRecords(mockPatients)
  )
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    buildCalendarEvents(mockPatients)
  )
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    buildNotifications(mockPatients)
  )
  const emails = useMemo(() => buildInboxEmails(patients), [patients])

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
          current.map((patient) =>
            patient.id === patientId
              ? { ...patient, paymentOverdueManual: manual }
              : patient
          )
        )
      },
      addSessionNote: (note) => {
        setSessionNotes((current) => [note, ...current])
        setPatients((current) =>
          current.map((patient) =>
            patient.id === note.patientId
              ? {
                  ...patient,
                  sessions: Math.max(patient.sessions, note.sessionNumber),
                }
              : patient
          )
        )
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
        setEvents((current) =>
          current.map((event) => {
            if (event.id !== id) return event

            const durationMin = Math.max(
              toMinutes(event.end) - toMinutes(event.start),
              30
            )
            const currentStatus = getEventStatus(event)
            const nextStatus = resolveStatusAfterMove(currentStatus)
            const rescheduledFrom = resolveRescheduledFromAfterMove(
              event,
              currentStatus,
              nextStatus
            )
            const patient = findPatientById(patients, event.patientId)
            const billing = resolveEventBilling(
              event,
              {
                date,
                start: minutesToTime(startMinutes),
                end: minutesToTime(startMinutes + durationMin),
                status: nextStatus,
                rescheduledFrom,
              },
              patient
            )

            return {
              ...event,
              date,
              start: minutesToTime(startMinutes),
              end: minutesToTime(startMinutes + durationMin),
              status: nextStatus,
              rescheduledFrom,
              ...billing,
            }
          })
        )
      },
      updateEvent: (updated) => {
        setEvents((current) => {
          const previous = current.find((event) => event.id === updated.id)
          if (!previous) return current

          const patient = findPatientById(
            patients,
            updated.patientId || previous.patientId
          )
          const billing = resolveEventBilling(previous, updated, patient)

          applySessionCountChange(
            setPatients,
            updated.patientId || previous.patientId,
            previous.status,
            updated.status
          )

          return current.map((event) =>
            event.id === updated.id
              ? {
                  ...updated,
                  ...billing,
                  rescheduledFrom:
                    getEventStatus(updated) === "remarcada"
                      ? updated.rescheduledFrom ?? previous.rescheduledFrom
                      : undefined,
                }
              : event
          )
        })
      },
      updateEventStatus: (id, status) => {
        setEvents((current) => {
          const previous = current.find((event) => event.id === id)
          if (!previous || previous.status === status) return current

          const patient = findPatientById(patients, previous.patientId)
          const billing = resolveEventBilling(previous, { status }, patient)

          applySessionCountChange(
            setPatients,
            previous.patientId,
            previous.status,
            status
          )

          return current.map((event) =>
            event.id === id
              ? {
                  ...event,
                  status,
                  ...billing,
                }
              : event
          )
        })
      },
      markEventPaid: (id, paid = true) =>
        setEvents((current) =>
          current.map((event) =>
            event.id === id && isBillableSession(event)
              ? { ...event, paid }
              : event
          )
        ),
      markAllEventsPaid: (ids) =>
        setEvents((current) => {
          const idSet = new Set(ids)
          return current.map((event) =>
            idSet.has(event.id) && isBillableSession(event)
              ? { ...event, paid: true }
              : event
          )
        }),
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
