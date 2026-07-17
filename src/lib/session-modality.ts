import {
  getWeekdayCode,
  normalizeWeekdayCode,
} from "@/data/patients"
import type {
  CalendarEvent,
  Patient,
  PatientModality,
  PatientSchedule,
} from "@/data/types"

export type SessionModality = Extract<PatientModality, "presencial" | "online">

export const sessionModalityOptions: readonly SessionModality[] = [
  "presencial",
  "online",
] as const

export function isSessionModality(
  value: unknown
): value is SessionModality {
  return value === "presencial" || value === "online"
}

/** Modalidade agregada do paciente a partir dos horários recorrentes. */
export function inferPatientModalityFromSchedules(
  schedules: PatientSchedule[]
): PatientModality {
  const modalities = new Set<SessionModality>()

  for (const schedule of schedules) {
    if (!schedule.time || !isSessionModality(schedule.modality)) continue
    modalities.add(schedule.modality)
  }

  if (modalities.size === 0) return "presencial"
  if (modalities.size === 1) return [...modalities][0]
  return "hibrido"
}

function matchScheduleModality(
  patient: Patient,
  date: Date,
  start: string
): SessionModality | undefined {
  const weekday = getWeekdayCode(date)
  const schedules = patient.schedules ?? []

  for (const schedule of schedules) {
    if (!schedule.time) continue
    if (normalizeWeekdayCode(schedule.weekday) !== weekday) continue
    if (schedule.time !== start) continue
    if (isSessionModality(schedule.modality)) return schedule.modality
  }

  return undefined
}

/** Modalidade efetiva de uma sessão (sessão salva ou horário do paciente). */
export function resolveSessionModality(
  event: Pick<CalendarEvent, "modality" | "date" | "start" | "patientId">,
  patient?: Patient | null
): SessionModality | undefined {
  if (isSessionModality(event.modality)) return event.modality
  if (!patient) return undefined

  const fromSchedule = matchScheduleModality(patient, event.date, event.start)
  if (fromSchedule) return fromSchedule

  if (isSessionModality(patient.modality)) return patient.modality

  return undefined
}
