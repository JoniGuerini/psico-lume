export type PatientStatus = "ativo" | "em-pausa" | "lista-espera" | "alta"

export type PatientModality = "presencial" | "online" | "hibrido"

/** Frequência da sessão recorrente na agenda (sessões por mês). */
export type SessionFrequency =
  | "1x-mes"
  | "2x-mes"
  | "3x-mes"
  | "4x-mes"

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
  modality: PatientModality
  price: string
  status: PatientStatus
  sessionDay: string
  sessionTime: string
  sessionDuration: number
  nextSession: string | null
  sessions: number
  since: string
  /** Frequência do horário recorrente (formulário do paciente). */
  sessionFrequency?: SessionFrequency
  /** null/undefined = automático pelas sessões; true/false = override manual no perfil. */
  paymentOverdueManual?: boolean | null
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
  /** Anotações gerais do cadastro (não confundir com evolução clínica). */
  notes?: string
  schedules?: PatientSchedule[]
  /** ISO local (YYYY-MM-DD): primeira data para gerar sessões recorrentes. */
  recurrenceFrom?: string
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
  /** Valor cobrado nesta sessão (padrão: preço do paciente). */
  amount?: number
  /** Sessões realizadas: false/undefined = pendente de pagamento. */
  paid?: boolean
  /** Faltou com aviso prévio — não gera cobrança. */
  absenceWithNotice?: boolean
  /** Horário original antes do primeiro reagendamento por arraste. */
  rescheduledFrom?: RescheduledFrom
  /** Presencial ou online — definido pelo horário recorrente ou sessão avulsa. */
  modality?: "presencial" | "online"
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
  /** Presente quando o registro está vinculado a uma sessão da agenda. */
  eventId?: string
  /** Nº da sessão na cronologia do paciente — só faz sentido quando vinculado. */
  sessionNumber?: number
  summary: string
  evolution: string
  plan?: string
  tags?: string[]
  mood?: string
  modality?: PatientModality
}
