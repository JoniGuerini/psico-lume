export type PatientStatus = "ativo" | "em-pausa" | "lista-espera" | "alta"

export type PatientModality = "presencial" | "online" | "hibrido"

export type PatientSchedule = {
  weekday: string
  time: string
  duration: string
  modality: PatientModality | ""
}

export type Patient = {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  complaint: string
  approach: string
  modality: PatientModality
  price: string
  status: PatientStatus
  sessionDay: string
  sessionTime: string
  sessionDuration: number
  nextSession: string | null
  sessions: number
  since: string
  paymentOverdue?: boolean
  biweekly?: boolean
  birthDate?: string
  gender?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  contactName?: string
  contactPhone?: string
  contactRelation?: string
  patientType?: string
  therapyStart?: string
  referral?: string
  schedules?: PatientSchedule[]
}

export type SessionStatus =
  | "agendada"
  | "realizada"
  | "faltou"
  | "remarcada"
  | "cancelada"

export type RescheduledFrom = {
  date: Date
  start: string
  end: string
}

export type CalendarEvent = {
  id: string
  patientId: string
  title: string
  date: Date
  start: string
  end: string
  status?: SessionStatus
  /** Horário original antes do primeiro reagendamento por arraste. */
  rescheduledFrom?: RescheduledFrom
}

export type NotificationCategory =
  | "sessao"
  | "paciente"
  | "mensagem"
  | "financeiro"
  | "sistema"

import type { LucideIcon } from "lucide-react"

export type Notification = {
  id: string
  icon: LucideIcon
  category: NotificationCategory
  title: string
  description: string
  date: Date
  read: boolean
}

export type InboxEmail = {
  id: string
  patientId?: string
  name: string
  email: string
  subject: string
  preview: string
  body: string[]
  date: string
  time: string
  read: boolean
  labels: string[]
}

export type SessionNote = {
  id: string
  patientId: string
  date: string
  sessionNumber: number
  summary: string
  evolution: string
  plan?: string
  tags?: string[]
  mood?: string
  modality?: PatientModality
}
