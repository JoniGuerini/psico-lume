import type { Patient } from "@/data/types"
import {
  PATIENT_PROFILE_EXTRAS,
  buildDefaultSchedule,
} from "@/data/patient-profiles"

export const WEEKDAY_CODES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const

export const WEEKDAY_LABELS: Record<string, string> = {
  Seg: "Segunda",
  Ter: "Terça",
  Qua: "Quarta",
  Qui: "Quinta",
  Sex: "Sexta",
}

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Dom: 0,
  Seg: 1,
  Ter: 2,
  Qua: 3,
  Qui: 4,
  Sex: 5,
  Sáb: 6,
}

export function getWeekdayCode(date: Date) {
  return WEEKDAY_CODES[date.getDay()]
}

export function getWeekdayIndex(code: string) {
  return WEEKDAY_TO_INDEX[code] ?? 0
}

export function parsePrice(price: string) {
  if (!price) return 0
  const normalized = price.replace(/\./g, "").replace(",", ".")
  const value = Number.parseFloat(normalized)
  return Number.isNaN(value) ? 0 : value
}

export function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number)
  const total = hours * 60 + mins + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

export function isScheduledPatient(patient: Patient) {
  return patient.status === "ativo" && patient.sessionTime !== ""
}

export function formatNextSession(day: string, time: string) {
  return `${day} · ${time}`
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

export function formatRelativeTime(date: Date) {
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000)

  if (diffMinutes < 1) return "agora"
  if (diffMinutes < 60) return `há ${diffMinutes} min`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return "ontem"
  if (diffDays < 7) return `há ${diffDays} dias`

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function patient(
  data: Omit<Patient, "nextSession" | "sessionDuration" | "schedules"> & {
    sessionDuration?: number
  }
): Patient {
  const sessionDuration = data.sessionDuration ?? 50
  const nextSession =
    data.status === "ativo" && data.sessionTime
      ? formatNextSession(data.sessionDay, data.sessionTime)
      : null

  const profile = PATIENT_PROFILE_EXTRAS[data.id] ?? {}
  const schedules =
    profile.schedules ??
    buildDefaultSchedule({
      status: data.status,
      sessionDay: data.sessionDay,
      sessionTime: data.sessionTime,
      sessionDuration,
      modality: data.modality,
    })

  return {
    ...data,
    ...profile,
    sessionDuration,
    nextSession,
    schedules,
  }
}

export const mockPatients: Patient[] = [
  patient({
    id: "1",
    name: "Mariana Lopes",
    cpf: "312.456.789-00",
    email: "mariana.lopes@example.com",
    phone: "(11) 99812-4471",
    complaint: "Ansiedade",
    approach: "TCC",
    modality: "online",
    price: "180,00",
    status: "ativo",
    sessionDay: "Qua",
    sessionTime: "09:00",
    sessions: 14,
    since: "Mar 2025",
  }),
  patient({
    id: "2",
    name: "Rafael Souza",
    cpf: "987.654.321-12",
    email: "rafael.souza@example.com",
    phone: "(11) 99654-3320",
    complaint: "Burnout",
    approach: "TCC",
    modality: "presencial",
    price: "200,00",
    status: "ativo",
    sessionDay: "Qua",
    sessionTime: "11:00",
    sessions: 8,
    since: "Jan 2026",
  }),
  patient({
    id: "3",
    name: "Camila Nunes",
    cpf: "456.789.123-00",
    email: "camila.nunes@example.com",
    phone: "(21) 98123-7788",
    complaint: "Relacionamento",
    approach: "Psicanálise",
    modality: "presencial",
    price: "220,00",
    status: "ativo",
    sessionDay: "Qui",
    sessionTime: "14:30",
    sessions: 22,
    since: "Set 2024",
  }),
  patient({
    id: "4",
    name: "Thiago Martins",
    cpf: "321.654.987-00",
    email: "thiago.martins@example.com",
    phone: "(11) 99441-2210",
    complaint: "Depressão",
    approach: "TCC",
    modality: "hibrido",
    price: "190,00",
    status: "em-pausa",
    sessionDay: "Seg",
    sessionTime: "",
    sessions: 31,
    since: "Fev 2024",
    paymentOverdue: true,
  }),
  patient({
    id: "5",
    name: "Ana Beatriz",
    cpf: "159.753.486-00",
    email: "ana.beatriz@example.com",
    phone: "(31) 98777-1102",
    complaint: "Luto",
    approach: "Humanista",
    modality: "online",
    price: "170,00",
    status: "ativo",
    sessionDay: "Sex",
    sessionTime: "10:00",
    sessions: 5,
    since: "Abr 2026",
  }),
  patient({
    id: "6",
    name: "Pedro Henrique",
    cpf: "753.951.852-00",
    email: "pedro.h@example.com",
    phone: "(11) 99012-5567",
    complaint: "Ansiedade social",
    approach: "TCC",
    modality: "online",
    price: "160,00",
    status: "lista-espera",
    sessionDay: "Seg",
    sessionTime: "",
    sessions: 0,
    since: "—",
  }),
  patient({
    id: "7",
    name: "Juliana Castro",
    cpf: "852.456.951-00",
    email: "juliana.castro@example.com",
    phone: "(48) 99654-8890",
    complaint: "Pânico",
    approach: "TCC",
    modality: "presencial",
    price: "210,00",
    status: "ativo",
    sessionDay: "Sex",
    sessionTime: "16:00",
    sessions: 12,
    since: "Out 2025",
  }),
  patient({
    id: "8",
    name: "Lucas Almeida",
    cpf: "147.258.369-00",
    email: "lucas.almeida@example.com",
    phone: "(11) 98321-4455",
    complaint: "Estresse profissional",
    approach: "Coaching",
    modality: "hibrido",
    price: "250,00",
    status: "alta",
    sessionDay: "Ter",
    sessionTime: "",
    sessions: 40,
    since: "Jan 2023",
  }),
  patient({
    id: "9",
    name: "Beatriz Ramos",
    cpf: "369.258.147-00",
    email: "bia.ramos@example.com",
    phone: "(85) 99100-2233",
    complaint: "Autoestima",
    approach: "Humanista",
    modality: "online",
    price: "175,00",
    status: "em-pausa",
    sessionDay: "Qua",
    sessionTime: "",
    sessions: 9,
    since: "Jul 2025",
    paymentOverdue: true,
  }),
  patient({
    id: "10",
    name: "Gustavo Pereira",
    cpf: "258.147.369-00",
    email: "gustavo.pereira@example.com",
    phone: "(11) 99765-0098",
    complaint: "TOC",
    approach: "TCC",
    modality: "presencial",
    price: "200,00",
    status: "ativo",
    sessionDay: "Seg",
    sessionTime: "08:30",
    sessions: 18,
    since: "Mai 2025",
  }),
  patient({
    id: "11",
    name: "Fernanda Dias",
    cpf: "741.852.963-00",
    email: "fernanda.dias@example.com",
    phone: "(11) 98654-7712",
    complaint: "Casal",
    approach: "Sistêmica",
    modality: "presencial",
    price: "280,00",
    status: "lista-espera",
    sessionDay: "Qui",
    sessionTime: "",
    sessions: 0,
    since: "—",
  }),
  patient({
    id: "12",
    name: "Otávio Ribeiro",
    cpf: "963.852.741-00",
    email: "otavio.ribeiro@example.com",
    phone: "(21) 99888-1145",
    complaint: "Fobia específica",
    approach: "TCC",
    modality: "hibrido",
    price: "190,00",
    status: "ativo",
    sessionDay: "Ter",
    sessionTime: "15:00",
    sessions: 6,
    since: "Mar 2026",
  }),
  patient({
    id: "13",
    name: "Carolina Mendes",
    cpf: "111.222.333-44",
    email: "carolina.mendes@example.com",
    phone: "(11) 99123-4401",
    complaint: "Insônia",
    approach: "TCC",
    modality: "online",
    price: "185,00",
    status: "ativo",
    sessionDay: "Seg",
    sessionTime: "10:00",
    sessions: 11,
    since: "Jun 2025",
  }),
  patient({
    id: "14",
    name: "Diego Fonseca",
    cpf: "222.333.444-55",
    email: "diego.fonseca@example.com",
    phone: "(11) 99234-5502",
    complaint: "Dependência emocional",
    approach: "Psicanálise",
    modality: "presencial",
    price: "210,00",
    status: "ativo",
    sessionDay: "Seg",
    sessionTime: "14:00",
    sessionDuration: 60,
    sessions: 16,
    since: "Ago 2024",
  }),
  patient({
    id: "15",
    name: "Elena Vasconcelos",
    cpf: "333.444.555-66",
    email: "elena.vasconcelos@example.com",
    phone: "(21) 99345-6603",
    complaint: "Trauma",
    approach: "EMDR",
    modality: "hibrido",
    price: "240,00",
    status: "ativo",
    sessionDay: "Ter",
    sessionTime: "09:00",
    sessions: 24,
    since: "Nov 2024",
    biweekly: true,
  }),
  patient({
    id: "16",
    name: "Fabiana Costa",
    cpf: "444.555.666-77",
    email: "fabiana.costa@example.com",
    phone: "(31) 99456-7704",
    complaint: "Conflitos familiares",
    approach: "Sistêmica",
    modality: "presencial",
    price: "195,00",
    status: "ativo",
    sessionDay: "Ter",
    sessionTime: "11:30",
    sessions: 9,
    since: "Dez 2025",
  }),
  patient({
    id: "17",
    name: "Gabriel Lima",
    cpf: "555.666.777-88",
    email: "gabriel.lima@example.com",
    phone: "(11) 99567-8805",
    complaint: "Procrastinação",
    approach: "TCC",
    modality: "online",
    price: "165,00",
    status: "ativo",
    sessionDay: "Ter",
    sessionTime: "17:00",
    sessions: 7,
    since: "Fev 2026",
  }),
  patient({
    id: "18",
    name: "Igor Santana",
    cpf: "666.777.888-99",
    email: "igor.santana@example.com",
    phone: "(48) 99678-9906",
    complaint: "Raiva",
    approach: "Humanista",
    modality: "presencial",
    price: "200,00",
    status: "ativo",
    sessionDay: "Qua",
    sessionTime: "14:00",
    sessions: 13,
    since: "Jul 2025",
  }),
  patient({
    id: "19",
    name: "Júlia Freitas",
    cpf: "777.888.999-00",
    email: "julia.freitas@example.com",
    phone: "(11) 99789-0017",
    complaint: "Dificuldade de limites",
    approach: "TCC",
    modality: "online",
    price: "175,00",
    status: "ativo",
    sessionDay: "Qua",
    sessionTime: "16:00",
    sessions: 4,
    since: "Mai 2026",
  }),
  patient({
    id: "20",
    name: "Karina Moura",
    cpf: "888.999.000-11",
    email: "karina.moura@example.com",
    phone: "(21) 99890-1128",
    complaint: "Estresse parental",
    approach: "Humanista",
    modality: "hibrido",
    price: "190,00",
    status: "ativo",
    sessionDay: "Qui",
    sessionTime: "09:00",
    sessions: 10,
    since: "Jan 2026",
  }),
  patient({
    id: "21",
    name: "Leonardo Duarte",
    cpf: "999.000.111-22",
    email: "leonardo.duarte@example.com",
    phone: "(11) 99901-2239",
    complaint: "Síndrome do impostor",
    approach: "TCC",
    modality: "online",
    price: "180,00",
    status: "ativo",
    sessionDay: "Qui",
    sessionTime: "11:00",
    sessions: 15,
    since: "Out 2024",
  }),
  patient({
    id: "22",
    name: "Mônica Teixeira",
    cpf: "100.111.222-33",
    email: "monica.teixeira@example.com",
    phone: "(31) 99012-3340",
    complaint: "Compulsão alimentar",
    approach: "TCC",
    modality: "presencial",
    price: "205,00",
    status: "ativo",
    sessionDay: "Sex",
    sessionTime: "08:30",
    sessions: 19,
    since: "Abr 2024",
  }),
  patient({
    id: "23",
    name: "Nora Azevedo",
    cpf: "211.222.333-44",
    email: "nora.azevedo@example.com",
    phone: "(85) 99123-4451",
    complaint: "Luto perinatal",
    approach: "Humanista",
    modality: "online",
    price: "170,00",
    status: "ativo",
    sessionDay: "Sex",
    sessionTime: "13:00",
    sessions: 3,
    since: "Jun 2026",
  }),
  patient({
    id: "24",
    name: "Paula Ribeiro",
    cpf: "322.433.544-55",
    email: "paula.ribeiro@example.com",
    phone: "(11) 99234-5562",
    complaint: "Adaptação cultural",
    approach: "TCC",
    modality: "online",
    price: "160,00",
    status: "ativo",
    sessionDay: "",
    sessionTime: "",
    sessions: 1,
    since: "Jun 2026",
  }),
  patient({
    id: "25",
    name: "Quésia Nogueira",
    cpf: "433.544.655-66",
    email: "quesia.nogueira@example.com",
    phone: "(48) 99345-6673",
    complaint: "Autocrítica",
    approach: "ACT",
    modality: "hibrido",
    price: "185,00",
    status: "ativo",
    sessionDay: "",
    sessionTime: "",
    sessions: 2,
    since: "Mai 2026",
  }),
  patient({
    id: "26",
    name: "Renato Vieira",
    cpf: "544.655.766-77",
    email: "renato.vieira@example.com",
    phone: "(21) 99456-7784",
    complaint: "Burnout",
    approach: "TCC",
    modality: "presencial",
    price: "195,00",
    status: "em-pausa",
    sessionDay: "Ter",
    sessionTime: "",
    sessions: 27,
    since: "Mar 2024",
    paymentOverdue: true,
  }),
  patient({
    id: "27",
    name: "Simone Cardoso",
    cpf: "655.766.877-88",
    email: "simone.cardoso@example.com",
    phone: "(11) 99567-8895",
    complaint: "Ansiedade",
    approach: "Psicanálise",
    modality: "online",
    price: "180,00",
    status: "em-pausa",
    sessionDay: "Qui",
    sessionTime: "",
    sessions: 14,
    since: "Set 2025",
  }),
  patient({
    id: "28",
    name: "Tatiana Borges",
    cpf: "766.877.988-99",
    email: "tatiana.borges@example.com",
    phone: "(31) 99678-9906",
    complaint: "Depressão",
    approach: "TCC",
    modality: "online",
    price: "160,00",
    status: "lista-espera",
    sessionDay: "Qua",
    sessionTime: "",
    sessions: 0,
    since: "—",
  }),
  patient({
    id: "29",
    name: "Ulisses Gomes",
    cpf: "877.988.099-00",
    email: "ulisses.gomes@example.com",
    phone: "(48) 99789-0017",
    complaint: "TEPT",
    approach: "EMDR",
    modality: "presencial",
    price: "230,00",
    status: "lista-espera",
    sessionDay: "Sex",
    sessionTime: "",
    sessions: 0,
    since: "—",
  }),
  patient({
    id: "30",
    name: "Valéria Pinto",
    cpf: "988.099.110-11",
    email: "valeria.pinto@example.com",
    phone: "(11) 99890-1128",
    complaint: "Fobias",
    approach: "TCC",
    modality: "hibrido",
    price: "200,00",
    status: "alta",
    sessionDay: "Seg",
    sessionTime: "",
    sessions: 36,
    since: "Jun 2023",
  }),
]

export function findPatient(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)
}

export function findPatientByName(patients: Patient[], name: string) {
  return patients.find((patient) => patient.name === name)
}

export function getActivePatients(patients: Patient[]) {
  return patients.filter((patient) => patient.status === "ativo")
}

export function getScheduledPatients(patients: Patient[]) {
  return patients.filter(isScheduledPatient)
}

export function getTodaysAppointments(patients: Patient[], date = new Date()) {
  const todayCode = getWeekdayCode(date)
  return getScheduledPatients(patients)
    .filter((patient) => patient.sessionDay === todayCode)
    .sort((a, b) => a.sessionTime.localeCompare(b.sessionTime))
}

export function getOverduePatients(patients: Patient[]) {
  return patients.filter((patient) => patient.paymentOverdue)
}
