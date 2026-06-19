import { createContext, useContext, useMemo, useState } from "react"

import { buildCalendarEvents } from "@/data/calendar"
import { buildClinicalRecords } from "@/data/clinical-records"
import { buildInboxEmails } from "@/data/inbox"
import { buildNotifications } from "@/data/notifications"
import {
  formatNextSession,
  getActivePatients,
  getOverduePatients,
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
  addPatient: (patient: Patient) => void
  updatePatient: (patient: Patient) => void
  addSessionNote: (note: SessionNote) => void
  addEvent: (event: CalendarEvent) => void
  moveEvent: (id: string, date: Date, startMinutes: number) => void
  updateEvent: (event: CalendarEvent) => void
  updateEventStatus: (id: string, status: SessionStatus) => void
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
  const overduePatients = useMemo(() => getOverduePatients(patients), [patients])
  const overdueValue = useMemo(
    () =>
      overduePatients.reduce((sum, patient) => sum + parsePrice(patient.price), 0),
    [overduePatients]
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
      addPatient: (patient) => {
        setPatients((current) => [patient, ...current])
        if (patient.status === "ativo" && patient.sessionTime) {
          setEvents((current) =>
            mergeEventStatuses(current, [
              ...current,
              ...buildCalendarEvents([patient]),
            ])
          )
        }
      },
      updatePatient: (patient) => {
        setPatients((current) => {
          const next = current.map((item) =>
            item.id === patient.id ? patient : item
          )
          setEvents((events) => {
            const manual = events.filter((event) => event.patientId === "")
            return mergeEventStatuses(events, [
              ...manual,
              ...buildCalendarEvents(next),
            ])
          })
          return next
        })
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
      addEvent: (event) =>
        setEvents((current) => [
          ...current,
          { ...event, status: event.status ?? "agendada" },
        ]),
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

            return {
              ...event,
              date,
              start: minutesToTime(startMinutes),
              end: minutesToTime(startMinutes + durationMin),
              status: nextStatus,
              rescheduledFrom,
            }
          })
        )
      },
      updateEvent: (updated) => {
        setEvents((current) => {
          const previous = current.find((event) => event.id === updated.id)
          if (!previous) return current

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

          applySessionCountChange(
            setPatients,
            previous.patientId,
            previous.status,
            status
          )

          return current.map((event) =>
            event.id === id ? { ...event, status } : event
          )
        })
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
