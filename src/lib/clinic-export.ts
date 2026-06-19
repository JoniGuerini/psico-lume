import { modalityLabel, statusConfig } from "@/components/patients-page"
import { parsePrice } from "@/data/patients"
import type {
  CalendarEvent,
  Patient,
  SessionNote,
} from "@/data/types"
import {
  buildStyledWorkbookBuffer,
  type ExportRow,
  type StyledSheetConfig,
} from "@/lib/clinic-export-xlsx"
import {
  getEventStatus,
  sessionStatusConfig,
} from "@/lib/session-status"
import { isPatientOverdue } from "@/lib/session-payment"
import { sessionFrequencyLabel } from "@/lib/session-frequency"
const WEEKS_PER_MONTH = 4.33

export type ClinicExportData = {
  patients: Patient[]
  events: CalendarEvent[]
  sessionNotes: SessionNote[]
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR")
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function durationMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

function patientNameById(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)?.name ?? ""
}

function buildPatientsRows(
  patients: Patient[],
  events: CalendarEvent[]
): ExportRow[] {
  return patients.map((patient) => ({
    ID: patient.id,
    Nome: patient.name,
    CPF: patient.cpf,
    Email: patient.email,
    Telefone: patient.phone,
    Status: statusConfig[patient.status].label,
    Modalidade: modalityLabel[patient.modality],
    Queixa: patient.complaint,
    Abordagem: patient.approach,
    "Valor sessão (R$)": patient.price,
    "Dia sessão": patient.sessionDay,
    "Horário sessão": patient.sessionTime,
    "Duração (min)": patient.sessionDuration,
    "Próxima sessão": patient.nextSession ?? "",
    "Sessões realizadas": patient.sessions,
    "Paciente desde": patient.since,
    Frequência: sessionFrequencyLabel(patient.sessionFrequency),
    Inadimplente: isPatientOverdue(patient, events) ? "Sim" : "Não",
    "Data nascimento": patient.birthDate ?? "",
    Gênero: patient.gender ?? "",
    CEP: patient.cep ?? "",
    Logradouro: patient.street ?? "",
    Número: patient.number ?? "",
    Complemento: patient.complement ?? "",
    Bairro: patient.neighborhood ?? "",
    Cidade: patient.city ?? "",
    Estado: patient.state ?? "",
    "Contato emergência": patient.contactName ?? "",
    "Tel. emergência": patient.contactPhone ?? "",
    Parentesco: patient.contactRelation ?? "",
    "Tipo paciente": patient.patientType ?? "",
    "Início terapia": patient.therapyStart ?? "",
    Encaminhamento: patient.referral ?? "",
    _patientStatus: patient.status,
  }))
}

function buildSchedulesRows(patients: Patient[]): ExportRow[] {
  const rows: ExportRow[] = []
  for (const patient of patients) {
    if (!patient.schedules?.length) continue
    for (const [index, schedule] of patient.schedules.entries()) {
      rows.push({
        "ID Paciente": patient.id,
        Paciente: patient.name,
        "#": index + 1,
        Dia: schedule.weekday,
        Horário: schedule.time,
        "Duração (min)": schedule.duration,
        Modalidade: schedule.modality
          ? modalityLabel[schedule.modality]
          : "",
      })
    }
  }
  return rows
}

function buildAgendaRows(patients: Patient[], events: CalendarEvent[]): ExportRow[] {
  return [...events]
    .sort((a, b) => {
      const dayDiff = a.date.getTime() - b.date.getTime()
      if (dayDiff !== 0) return dayDiff
      return a.start.localeCompare(b.start)
    })
    .map((event) => {
      const status = getEventStatus(event)
      return {
        "ID Sessão": event.id,
        "ID Paciente": event.patientId,
        Paciente: event.patientId
          ? patientNameById(patients, event.patientId)
          : event.title,
        Data: formatDate(event.date),
        Início: event.start,
        Fim: event.end,
        "Duração (min)": durationMinutes(event.start, event.end),
        Status: sessionStatusConfig[status].label,
        "Data original": event.rescheduledFrom
          ? formatDate(event.rescheduledFrom.date)
          : "",
        "Início original": event.rescheduledFrom?.start ?? "",
        "Fim original": event.rescheduledFrom?.end ?? "",
        _sessionStatus: status,
      }
    })
}

function buildRecordsRows(patients: Patient[], sessionNotes: SessionNote[]): ExportRow[] {  return [...sessionNotes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((note) => ({
      ID: note.id,
      "ID Paciente": note.patientId,
      Paciente: patientNameById(patients, note.patientId),
      Data: note.date,
      "Nº sessão": note.sessionNumber,
      Resumo: note.summary,
      Evolução: note.evolution,
      Plano: note.plan ?? "",
      Tags: note.tags?.join(", ") ?? "",
      Humor: note.mood ?? "",
      Modalidade: note.modality ? modalityLabel[note.modality] : "",
    }))
}

function buildFinancePatientRows(
  patients: Patient[],
  events: CalendarEvent[]
): ExportRow[] {
  const scheduled = patients.filter(
    (patient) => patient.status === "ativo" && patient.sessionTime
  )

  return patients.map((patient) => {
    const sessionPrice = parsePrice(patient.price)
    const realizedRevenue = sessionPrice * patient.sessions
    const monthlyForecast = scheduled.includes(patient)
      ? Math.round(sessionPrice * WEEKS_PER_MONTH)
      : 0

    return {
      "ID Paciente": patient.id,
      Nome: patient.name,
      Status: statusConfig[patient.status].label,
      Modalidade: modalityLabel[patient.modality],
      "Valor sessão (R$)": patient.price,
      "Sessões realizadas": patient.sessions,
      "Receita realizada (R$)": realizedRevenue,
      "Receita prevista/mês (R$)": monthlyForecast,
      Inadimplente: isPatientOverdue(patient, events) ? "Sim" : "Não",
      _patientStatus: patient.status,
    }
  })
}

function buildFinanceSessionRows(patients: Patient[], events: CalendarEvent[]): ExportRow[] {  return [...events]
    .sort((a, b) => {
      const dayDiff = a.date.getTime() - b.date.getTime()
      if (dayDiff !== 0) return dayDiff
      return a.start.localeCompare(b.start)
    })
    .map((event) => {
      const status = getEventStatus(event)
      const patient = patients.find((item) => item.id === event.patientId)
      const sessionPrice = patient ? parsePrice(patient.price) : 0
      const countsAsRevenue = status === "realizada"

      return {
        "ID Sessão": event.id,
        Data: formatDate(event.date),
        Paciente: patient?.name ?? event.title,
        Horário: `${event.start} – ${event.end}`,
        Status: sessionStatusConfig[status].label,
        "Valor sessão (R$)": patient?.price ?? "",
        "Contabiliza receita": countsAsRevenue ? "Sim" : "Não",
        "Valor contabilizado (R$)": countsAsRevenue ? sessionPrice : 0,
        _sessionStatus: status,
      }
    })
}

function buildSummaryRows(data: ClinicExportData): ExportRow[] {  const { patients, events, sessionNotes } = data
  const scheduled = patients.filter(
    (patient) => patient.status === "ativo" && patient.sessionTime
  )
  const weeklyRevenue = scheduled.reduce(
    (sum, patient) => sum + parsePrice(patient.price),
    0
  )
  const monthlyRevenue = Math.round(weeklyRevenue * WEEKS_PER_MONTH)
  const realizedSessions = events.filter(
    (event) => getEventStatus(event) === "realizada"
  ).length
  const realizedRevenue = patients.reduce(
    (sum, patient) => sum + parsePrice(patient.price) * patient.sessions,
    0
  )
  const overduePatients = patients.filter((patient) =>
    isPatientOverdue(patient, events)
  )
  const overdueValue = overduePatients.reduce(
    (sum, patient) => sum + parsePrice(patient.price),
    0
  )
  const exportedAt = new Date().toLocaleString("pt-BR")

  return [
    { Métrica: "Exportado em", Valor: exportedAt },
    { Métrica: "Total de pacientes", Valor: patients.length },
    { Métrica: "Pacientes ativos", Valor: patients.filter((p) => p.status === "ativo").length },
    { Métrica: "Sessões na agenda", Valor: events.length },
    { Métrica: "Sessões realizadas (agenda)", Valor: realizedSessions },
    { Métrica: "Notas de prontuário", Valor: sessionNotes.length },
    { Métrica: "Receita prevista/mês", Valor: formatCurrency(monthlyRevenue) },
    { Métrica: "Receita realizada (pacientes)", Valor: formatCurrency(realizedRevenue) },
    { Métrica: "Pacientes inadimplentes", Valor: overduePatients.length },
    { Métrica: "Valor em atraso", Valor: formatCurrency(overdueValue) },
  ]
}

function buildStyledSheetConfigs(data: ClinicExportData): StyledSheetConfig[] {
  return [
    { name: "Resumo", rows: buildSummaryRows(data) },
    {
      name: "Pacientes",
      rows: buildPatientsRows(data.patients, data.events),
      overdueColumn: "Inadimplente",
      patientStatusColumn: "Status",
      patientStatusKey: "_patientStatus",
    },
    { name: "Horários", rows: buildSchedulesRows(data.patients) },
    {
      name: "Agenda",
      rows: buildAgendaRows(data.patients, data.events),
      sessionStatusKey: "_sessionStatus",
    },
    { name: "Prontuário", rows: buildRecordsRows(data.patients, data.sessionNotes) },
    {
      name: "Fin. Pacientes",
      rows: buildFinancePatientRows(data.patients, data.events),
      overdueColumn: "Inadimplente",
      patientStatusColumn: "Status",
      patientStatusKey: "_patientStatus",
    },
    {
      name: "Fin. Sessões",
      rows: buildFinanceSessionRows(data.patients, data.events),
      sessionStatusKey: "_sessionStatus",
    },
  ]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function exportFilename(ext: string) {
  const stamp = new Date().toISOString().slice(0, 10)
  return `lume-export-${stamp}.${ext}`
}

export async function exportClinicXlsx(data: ClinicExportData) {
  const buffer = await buildStyledWorkbookBuffer(buildStyledSheetConfigs(data))
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    exportFilename("xlsx")
  )
}
