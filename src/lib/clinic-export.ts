import { modalityLabel, statusConfig } from "@/components/patients-page"
import { parsePrice } from "@/data/patients"
import type {
  CalendarEvent,
  Patient,
  PatientModality,
  SessionNote,
} from "@/data/types"
import {
  buildStyledWorkbookBuffer,
  type ExportRow,
  type StyledSheetConfig,
} from "@/lib/clinic-export-xlsx"
import { getMonthlyFinanceSummary, getPatientBillableSummary } from "@/lib/finance-metrics"
import {
  getAttendanceByModality,
  getAttendanceHistory,
  getAttendanceSummary,
  getRevenueByModality,
  getSessionOutcomeBreakdown,
} from "@/lib/report-metrics"
import { sessionFrequencyLabel } from "@/lib/session-frequency"
import {
  getEventStatus,
  sessionStatusConfig,
} from "@/lib/session-status"
import {
  buildUnpaidSessionRows,
  getSessionAmount,
  isBillableSession,
  isPatientOverdue,
  isSessionPaid,
  isSessionPaymentOverdue,
  isSessionUnpaid,
} from "@/lib/session-payment"

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

function formatMonthLabel(date: Date) {
  const raw = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function yesNo(value: boolean | undefined) {
  if (value === undefined) return ""
  return value ? "Sim" : "Não"
}

function durationMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

function patientNameById(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)?.name ?? ""
}

function overdueManualLabel(patient: Patient) {
  if (patient.paymentOverdueManual === true) return "Sim (inadimplente)"
  if (patient.paymentOverdueManual === false) return "Sim (adimplente)"
  return "Automático"
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
    "Override inadimplência": overdueManualLabel(patient),
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
    Observações: patient.notes ?? "",
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
      const patient = patients.find((item) => item.id === event.patientId)
      const billable = isBillableSession(event)
      const amount = billable ? getSessionAmount(event, patient) : undefined

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
        Cobrável: billable ? "Sim" : "Não",
        "Valor (R$)": amount ?? "",
        Pago: billable ? yesNo(isSessionPaid(event)) : "",
        "Aviso prévio": status === "faltou" ? yesNo(event.absenceWithNotice) : "",
        "Data original": event.rescheduledFrom
          ? formatDate(event.rescheduledFrom.date)
          : "",
        "Início original": event.rescheduledFrom?.start ?? "",
        "Fim original": event.rescheduledFrom?.end ?? "",
        _sessionStatus: status,
      }
    })
}

function buildRecordsRows(
  patients: Patient[],
  sessionNotes: SessionNote[]
): ExportRow[] {
  return [...sessionNotes]
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
    (patient) =>
      patient.status === "ativo" &&
      (patient.sessionTime || (patient.schedules?.length ?? 0) > 0)
  )

  return patients.map((patient) => {
    const sessionPrice = parsePrice(patient.price)
    const summary = getPatientBillableSummary(patient.id, events, patient)
    const billable = events.filter(
      (event) => event.patientId === patient.id && isBillableSession(event)
    )
    const paidCount = billable.filter(isSessionPaid).length
    const unpaidCount = billable.filter(isSessionUnpaid).length
    const overdueTotal = summary.unpaidSessions
      .filter((event) => isSessionPaymentOverdue(event))
      .reduce((sum, event) => sum + getSessionAmount(event, patient), 0)
    const monthlyForecast = scheduled.some((item) => item.id === patient.id)
      ? Math.round(sessionPrice * WEEKS_PER_MONTH)
      : 0

    return {
      "ID Paciente": patient.id,
      Nome: patient.name,
      Status: statusConfig[patient.status].label,
      Modalidade: modalityLabel[patient.modality],
      "Valor sessão (R$)": patient.price,
      "Sessões cobráveis pagas": paidCount,
      "Sessões cobráveis pendentes": unpaidCount,
      "Receita recebida (R$)": summary.paidTotal,
      "A receber (R$)": summary.unpaidTotal,
      "Em atraso (R$)": overdueTotal,
      "Receita prevista/mês (R$)": monthlyForecast,
      Inadimplente: isPatientOverdue(patient, events) ? "Sim" : "Não",
      "Override inadimplência": overdueManualLabel(patient),
      _patientStatus: patient.status,
    }
  })
}

function buildFinanceSessionRows(
  patients: Patient[],
  events: CalendarEvent[],
  anchor = new Date()
): ExportRow[] {
  return [...events]
    .sort((a, b) => {
      const dayDiff = a.date.getTime() - b.date.getTime()
      if (dayDiff !== 0) return dayDiff
      return a.start.localeCompare(b.start)
    })
    .map((event) => {
      const status = getEventStatus(event)
      const patient = patients.find((item) => item.id === event.patientId)
      const billable = isBillableSession(event)
      const amount = billable ? getSessionAmount(event, patient) : 0
      const paid = billable && isSessionPaid(event)
      const unpaid = billable && isSessionUnpaid(event)
      const overdue = unpaid && isSessionPaymentOverdue(event, anchor)

      return {
        "ID Sessão": event.id,
        "ID Paciente": event.patientId,
        Data: formatDate(event.date),
        Paciente: patient?.name ?? event.title,
        Horário: `${event.start} – ${event.end}`,
        Status: sessionStatusConfig[status].label,
        Cobrável: billable ? "Sim" : "Não",
        "Aviso prévio": status === "faltou" ? yesNo(event.absenceWithNotice) : "",
        "Valor (R$)": billable ? amount : "",
        Pago: billable ? yesNo(paid) : "",
        "Em atraso": unpaid ? yesNo(overdue) : "",
        _sessionStatus: status,
      }
    })
}

function buildSummaryRows(data: ClinicExportData, anchor = new Date()): ExportRow[] {
  const { patients, events, sessionNotes } = data
  const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const monthLabel = formatMonthLabel(month)
  const finance = getMonthlyFinanceSummary(events, patients, month)
  const attendance = getAttendanceSummary(events, month, anchor)
  const unpaidSessions = buildUnpaidSessionRows(events, patients, anchor)
  const overduePatients = patients.filter((patient) =>
    isPatientOverdue(patient, events, anchor)
  )
  const scheduled = patients.filter(
    (patient) =>
      patient.status === "ativo" &&
      (patient.sessionTime || (patient.schedules?.length ?? 0) > 0)
  )
  const weeklyRevenue = scheduled.reduce(
    (sum, patient) => sum + parsePrice(patient.price),
    0
  )
  const monthlyForecast = Math.round(weeklyRevenue * WEEKS_PER_MONTH)
  const realizedSessions = events.filter(
    (event) => getEventStatus(event) === "realizada"
  ).length
  const exportedAt = anchor.toLocaleString("pt-BR")

  return [
    { Métrica: "Exportado em", Valor: exportedAt },
    { Métrica: "Total de pacientes", Valor: patients.length },
    {
      Métrica: "Pacientes ativos",
      Valor: patients.filter((patient) => patient.status === "ativo").length,
    },
    { Métrica: "Sessões na agenda", Valor: events.length },
    { Métrica: "Sessões realizadas (agenda)", Valor: realizedSessions },
    { Métrica: "Notas de prontuário", Valor: sessionNotes.length },
    {
      Métrica: `Taxa comparecimento (${monthLabel})`,
      Valor: `${attendance.rate}%`,
    },
    {
      Métrica: `Receita cobrável (${monthLabel})`,
      Valor: formatCurrency(finance.total),
    },
    {
      Métrica: `Receita recebida (${monthLabel})`,
      Valor: formatCurrency(finance.received),
    },
    {
      Métrica: `A receber (${monthLabel})`,
      Valor: formatCurrency(finance.pending),
    },
    { Métrica: "Receita prevista/mês (ativos)", Valor: formatCurrency(monthlyForecast) },
    { Métrica: "Sessões a receber (total)", Valor: unpaidSessions.length },
    { Métrica: "Pacientes inadimplentes", Valor: overduePatients.length },
    { Métrica: "Valor em atraso", Valor: formatCurrency(finance.overdue) },
  ]
}

function buildReportHistoryRows(
  events: CalendarEvent[],
  anchor = new Date()
): ExportRow[] {
  return getAttendanceHistory(events, 12, anchor).map((row) => ({
    Mês: row.month,
    "Taxa comparecimento (%)": row.taxa,
    Realizadas: row.realizadas,
    Faltas: row.faltas,
  }))
}

function buildReportCurrentMonthRows(
  patients: Patient[],
  events: CalendarEvent[],
  anchor = new Date()
): ExportRow[] {
  const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const rows: ExportRow[] = []

  const attendance = getAttendanceSummary(events, month, anchor)
  rows.push({
    Grupo: "Comparecimento",
    Item: formatMonthLabel(month),
    "Valor 1": `${attendance.rate}%`,
    "Valor 2": attendance.realizada,
    "Valor 3": attendance.faltou,
    "Valor 4": attendance.evaluated,
  })

  for (const row of getAttendanceByModality(events, patients, month, anchor)) {
    rows.push({
      Grupo: "Modalidade",
      Item: modalityLabel[row.modality],
      "Valor 1": `${row.rate}%`,
      "Valor 2": row.realizada,
      "Valor 3": row.faltou,
      "Valor 4": row.total,
    })
  }

  for (const row of getSessionOutcomeBreakdown(events, month, anchor)) {
    rows.push({
      Grupo: "Desfecho",
      Item: sessionStatusConfig[row.status].label,
      "Valor 1": row.count,
      "Valor 2": `${row.pct}%`,
      "Valor 3": "",
      "Valor 4": "",
    })
  }

  for (const row of getRevenueByModality(events, patients, month)) {
    rows.push({
      Grupo: "Receita cobrável",
      Item: modalityLabel[row.modality as PatientModality],
      "Valor 1": formatCurrency(row.value),
      "Valor 2": "",
      "Valor 3": "",
      "Valor 4": "",
    })
  }

  return rows
}

export function buildClinicSheets(
  data: ClinicExportData,
  anchor = new Date()
): StyledSheetConfig[] {
  return buildStyledSheetConfigs(data, anchor)
}

function buildStyledSheetConfigs(
  data: ClinicExportData,
  anchor = new Date()
): StyledSheetConfig[] {
  return [
    { name: "Resumo", rows: buildSummaryRows(data, anchor) },
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
    {
      name: "Prontuário",
      rows: buildRecordsRows(data.patients, data.sessionNotes),
    },
    {
      name: "Fin. Pacientes",
      rows: buildFinancePatientRows(data.patients, data.events),
      overdueColumn: "Inadimplente",
      patientStatusColumn: "Status",
      patientStatusKey: "_patientStatus",
    },
    {
      name: "Fin. Sessões",
      rows: buildFinanceSessionRows(data.patients, data.events, anchor),
      sessionStatusKey: "_sessionStatus",
      overdueColumn: "Em atraso",
    },
    {
      name: "Rel. histórico",
      rows: buildReportHistoryRows(data.events, anchor),
    },
    {
      name: "Rel. mês atual",
      rows: buildReportCurrentMonthRows(data.patients, data.events, anchor),
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
