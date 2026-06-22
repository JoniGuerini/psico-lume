import { parsePrice } from "@/data/patients"
import type {
  CalendarEvent,
  Patient,
  PatientModality,
  SessionNote,
} from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import {
  buildStyledWorkbookBuffer,
  type ExportRow,
  type ExportSheetKey,
  type StyledSheetConfig,
} from "@/lib/clinic-export-xlsx"
import { getMonthlyFinanceSummary, getPatientBillableSummary } from "@/lib/finance-metrics"
import {
  formatLocaleCurrency,
  formatLocaleDate,
  getModalityLabel,
  getMoodLabel,
  getPatientStatusLabel,
  getSessionFrequencyLabel,
  getSessionStatusLabel,
} from "@/lib/i18n-helpers"
import {
  getAttendanceByModality,
  getAttendanceHistory,
  getAttendanceSummary,
  getRevenueByModality,
  getSessionOutcomeBreakdown,
} from "@/lib/report-metrics"
import { intlLocale, type Locale } from "@/lib/locale"
import {
  getEventStatus,
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

export type ClinicExportContext = {
  t: TranslateFn
  locale: Locale
}

type ColumnLabels = ReturnType<typeof buildColumnLabels>

function buildColumnLabels(t: TranslateFn) {
  const c = (key: string) => t(`exportSheets.columns.${key}`)
  return {
    id: c("id"),
    name: c("name"),
    cpf: c("cpf"),
    email: c("email"),
    phone: c("phone"),
    status: c("status"),
    modality: c("modality"),
    complaint: c("complaint"),
    sessionPrice: c("sessionPrice"),
    sessionDay: c("sessionDay"),
    sessionTime: c("sessionTime"),
    durationMin: c("durationMin"),
    nextSession: c("nextSession"),
    sessionsCompleted: c("sessionsCompleted"),
    patientSince: c("patientSince"),
    frequency: c("frequency"),
    overdue: c("overdue"),
    overdueOverride: c("overdueOverride"),
    birthDate: c("birthDate"),
    gender: c("gender"),
    cep: c("cep"),
    street: c("street"),
    number: c("number"),
    complement: c("complement"),
    neighborhood: c("neighborhood"),
    city: c("city"),
    state: c("state"),
    emergencyContact: c("emergencyContact"),
    emergencyPhone: c("emergencyPhone"),
    contactRelation: c("contactRelation"),
    patientType: c("patientType"),
    therapyStart: c("therapyStart"),
    referral: c("referral"),
    notes: c("notes"),
    patientId: c("patientId"),
    patient: c("patient"),
    index: c("index"),
    weekday: c("weekday"),
    time: c("time"),
    sessionId: c("sessionId"),
    date: c("date"),
    start: c("start"),
    end: c("end"),
    billable: c("billable"),
    amount: c("amount"),
    paid: c("paid"),
    notice: c("notice"),
    originalDate: c("originalDate"),
    originalStart: c("originalStart"),
    originalEnd: c("originalEnd"),
    sessionNumber: c("sessionNumber"),
    summary: c("summary"),
    evolution: c("evolution"),
    plan: c("plan"),
    tags: c("tags"),
    mood: c("mood"),
    paidBillableSessions: c("paidBillableSessions"),
    pendingBillableSessions: c("pendingBillableSessions"),
    receivedRevenue: c("receivedRevenue"),
    pendingRevenue: c("pendingRevenue"),
    overdueRevenue: c("overdueRevenue"),
    monthlyForecastRevenue: c("monthlyForecastRevenue"),
    timeRange: c("timeRange"),
    overduePayment: c("overduePayment"),
    metric: c("metric"),
    value: c("value"),
    month: c("month"),
    attendanceRate: c("attendanceRate"),
    completed: c("completed"),
    absences: c("absences"),
    group: c("group"),
    item: c("item"),
    value1: c("value1"),
    value2: c("value2"),
    value3: c("value3"),
    value4: c("value4"),
  }
}

function formatMonthLabel(date: Date, locale: Locale) {
  const raw = formatLocaleDate(date, locale, {
    month: "long",
    year: "numeric",
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function formatDate(date: Date, locale: Locale) {
  return formatLocaleDate(date, locale)
}

function formatDateTime(date: Date, locale: Locale) {
  return date.toLocaleString(intlLocale(locale))
}

function yesNo(ctx: ClinicExportContext, value: boolean | undefined) {
  if (value === undefined) return ""
  return value ? ctx.t("common.yes") : ctx.t("common.no")
}

function durationMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

function patientNameById(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)?.name ?? ""
}

function overdueManualLabel(ctx: ClinicExportContext, patient: Patient) {
  if (patient.paymentOverdueManual === true) {
    return ctx.t("exportSheets.common.overdueManualOverdue")
  }
  if (patient.paymentOverdueManual === false) {
    return ctx.t("exportSheets.common.overdueManualCurrent")
  }
  return ctx.t("exportSheets.common.automatic")
}

function buildPatientsRows(
  patients: Patient[],
  events: CalendarEvent[],
  ctx: ClinicExportContext,
  cols: ColumnLabels
): ExportRow[] {
  const yes = ctx.t("common.yes")
  return patients.map((patient) => {
    const overdue = isPatientOverdue(patient, events)
    return {
      [cols.id]: patient.id,
      [cols.name]: patient.name,
      [cols.cpf]: patient.cpf,
      [cols.email]: patient.email,
      [cols.phone]: patient.phone,
      [cols.status]: getPatientStatusLabel(ctx.t, patient.status),
      [cols.modality]: getModalityLabel(ctx.t, patient.modality),
      [cols.complaint]: patient.complaint,
      [cols.sessionPrice]: patient.price,
      [cols.sessionDay]: patient.sessionDay,
      [cols.sessionTime]: patient.sessionTime,
      [cols.durationMin]: patient.sessionDuration,
      [cols.nextSession]: patient.nextSession ?? "",
      [cols.sessionsCompleted]: patient.sessions,
      [cols.patientSince]: patient.since,
      [cols.frequency]: getSessionFrequencyLabel(ctx.t, patient.sessionFrequency),
      [cols.overdue]: overdue ? yes : ctx.t("common.no"),
      [cols.overdueOverride]: overdueManualLabel(ctx, patient),
      [cols.birthDate]: patient.birthDate ?? "",
      [cols.gender]: patient.gender ?? "",
      [cols.cep]: patient.cep ?? "",
      [cols.street]: patient.street ?? "",
      [cols.number]: patient.number ?? "",
      [cols.complement]: patient.complement ?? "",
      [cols.neighborhood]: patient.neighborhood ?? "",
      [cols.city]: patient.city ?? "",
      [cols.state]: patient.state ?? "",
      [cols.emergencyContact]: patient.contactName ?? "",
      [cols.emergencyPhone]: patient.contactPhone ?? "",
      [cols.contactRelation]: patient.contactRelation ?? "",
      [cols.patientType]: patient.patientType ?? "",
      [cols.therapyStart]: patient.therapyStart ?? "",
      [cols.referral]: patient.referral ?? "",
      [cols.notes]: patient.notes ?? "",
      _patientStatus: patient.status,
      _highlightOverdue: overdue,
    }
  })
}

function buildSchedulesRows(
  patients: Patient[],
  ctx: ClinicExportContext,
  cols: ColumnLabels
): ExportRow[] {
  const rows: ExportRow[] = []
  for (const patient of patients) {
    if (!patient.schedules?.length) continue
    for (const [index, schedule] of patient.schedules.entries()) {
      rows.push({
        [cols.patientId]: patient.id,
        [cols.patient]: patient.name,
        [cols.index]: index + 1,
        [cols.weekday]: schedule.weekday,
        [cols.time]: schedule.time,
        [cols.durationMin]: schedule.duration,
        [cols.modality]: schedule.modality
          ? getModalityLabel(ctx.t, schedule.modality)
          : "",
      })
    }
  }
  return rows
}

function buildAgendaRows(
  patients: Patient[],
  events: CalendarEvent[],
  ctx: ClinicExportContext,
  cols: ColumnLabels
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
      const amount = billable ? getSessionAmount(event, patient) : undefined

      return {
        [cols.sessionId]: event.id,
        [cols.patientId]: event.patientId,
        [cols.patient]: event.patientId
          ? patientNameById(patients, event.patientId)
          : event.title,
        [cols.date]: formatDate(event.date, ctx.locale),
        [cols.start]: event.start,
        [cols.end]: event.end,
        [cols.durationMin]: durationMinutes(event.start, event.end),
        [cols.status]: getSessionStatusLabel(ctx.t, status),
        [cols.billable]: billable ? ctx.t("common.yes") : ctx.t("common.no"),
        [cols.amount]: amount ?? "",
        [cols.paid]: billable ? yesNo(ctx, isSessionPaid(event)) : "",
        [cols.notice]:
          status === "faltou" ? yesNo(ctx, event.absenceWithNotice) : "",
        [cols.originalDate]: event.rescheduledFrom
          ? formatDate(event.rescheduledFrom.date, ctx.locale)
          : "",
        [cols.originalStart]: event.rescheduledFrom?.start ?? "",
        [cols.originalEnd]: event.rescheduledFrom?.end ?? "",
        _sessionStatus: status,
      }
    })
}

function buildRecordsRows(
  patients: Patient[],
  sessionNotes: SessionNote[],
  ctx: ClinicExportContext,
  cols: ColumnLabels
): ExportRow[] {
  return [...sessionNotes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((note) => ({
      [cols.id]: note.id,
      [cols.patientId]: note.patientId,
      [cols.patient]: patientNameById(patients, note.patientId),
      [cols.date]: note.date,
      [cols.sessionNumber]: note.sessionNumber,
      [cols.summary]: note.summary,
      [cols.evolution]: note.evolution,
      [cols.plan]: note.plan ?? "",
      [cols.tags]: note.tags?.join(", ") ?? "",
      [cols.mood]: note.mood ? getMoodLabel(ctx.t, note.mood) : "",
      [cols.modality]: note.modality
        ? getModalityLabel(ctx.t, note.modality)
        : "",
    }))
}

function buildFinancePatientRows(
  patients: Patient[],
  events: CalendarEvent[],
  ctx: ClinicExportContext,
  cols: ColumnLabels
): ExportRow[] {
  const scheduled = patients.filter(
    (patient) =>
      patient.status === "ativo" &&
      (patient.sessionTime || (patient.schedules?.length ?? 0) > 0)
  )
  const yes = ctx.t("common.yes")

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
    const overdue = isPatientOverdue(patient, events)

    return {
      [cols.patientId]: patient.id,
      [cols.name]: patient.name,
      [cols.status]: getPatientStatusLabel(ctx.t, patient.status),
      [cols.modality]: getModalityLabel(ctx.t, patient.modality),
      [cols.sessionPrice]: patient.price,
      [cols.paidBillableSessions]: paidCount,
      [cols.pendingBillableSessions]: unpaidCount,
      [cols.receivedRevenue]: summary.paidTotal,
      [cols.pendingRevenue]: summary.unpaidTotal,
      [cols.overdueRevenue]: overdueTotal,
      [cols.monthlyForecastRevenue]: monthlyForecast,
      [cols.overdue]: overdue ? yes : ctx.t("common.no"),
      [cols.overdueOverride]: overdueManualLabel(ctx, patient),
      _patientStatus: patient.status,
      _highlightOverdue: overdue,
    }
  })
}

function buildFinanceSessionRows(
  patients: Patient[],
  events: CalendarEvent[],
  ctx: ClinicExportContext,
  cols: ColumnLabels,
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
        [cols.sessionId]: event.id,
        [cols.patientId]: event.patientId,
        [cols.date]: formatDate(event.date, ctx.locale),
        [cols.patient]: patient?.name ?? event.title,
        [cols.timeRange]: `${event.start} – ${event.end}`,
        [cols.status]: getSessionStatusLabel(ctx.t, status),
        [cols.billable]: billable ? ctx.t("common.yes") : ctx.t("common.no"),
        [cols.notice]:
          status === "faltou" ? yesNo(ctx, event.absenceWithNotice) : "",
        [cols.amount]: billable ? amount : "",
        [cols.paid]: billable ? yesNo(ctx, paid) : "",
        [cols.overduePayment]: unpaid ? yesNo(ctx, overdue) : "",
        _sessionStatus: status,
        _highlightOverdue: unpaid && overdue,
      }
    })
}

function buildSummaryRows(
  data: ClinicExportData,
  ctx: ClinicExportContext,
  cols: ColumnLabels,
  anchor = new Date()
): ExportRow[] {
  const { patients, events, sessionNotes } = data
  const { t, locale } = ctx
  const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const monthLabel = formatMonthLabel(month, locale)
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
  const exportedAt = formatDateTime(anchor, locale)

  const metrics: Array<{ label: string; value: string | number; overdue?: boolean }> = [
    { label: t("exportSheets.summary.exportedAt"), value: exportedAt },
    { label: t("exportSheets.summary.totalPatients"), value: patients.length },
    {
      label: t("exportSheets.summary.activePatients"),
      value: patients.filter((patient) => patient.status === "ativo").length,
    },
    { label: t("exportSheets.summary.calendarSessions"), value: events.length },
    {
      label: t("exportSheets.summary.completedCalendarSessions"),
      value: realizedSessions,
    },
    { label: t("exportSheets.summary.recordNotes"), value: sessionNotes.length },
    {
      label: t("exportSheets.summary.attendanceRate", { month: monthLabel }),
      value: `${attendance.rate}%`,
    },
    {
      label: t("exportSheets.summary.billableRevenue", { month: monthLabel }),
      value: formatLocaleCurrency(finance.total, locale),
    },
    {
      label: t("exportSheets.summary.receivedRevenue", { month: monthLabel }),
      value: formatLocaleCurrency(finance.received, locale),
    },
    {
      label: t("exportSheets.summary.pendingRevenue", { month: monthLabel }),
      value: formatLocaleCurrency(finance.pending, locale),
    },
    {
      label: t("exportSheets.summary.monthlyForecast"),
      value: formatLocaleCurrency(monthlyForecast, locale),
    },
    {
      label: t("exportSheets.summary.unpaidSessionsTotal"),
      value: unpaidSessions.length,
    },
    {
      label: t("exportSheets.summary.overduePatients"),
      value: overduePatients.length,
    },
    {
      label: t("exportSheets.summary.overdueAmount"),
      value: formatLocaleCurrency(finance.overdue, locale),
      overdue: true,
    },
  ]

  return metrics.map((metric) => ({
    [cols.metric]: metric.label,
    [cols.value]: metric.value,
    ...(metric.overdue ? { _summaryOverdue: true } : {}),
  }))
}

function buildReportHistoryRows(
  events: CalendarEvent[],
  cols: ColumnLabels,
  anchor = new Date()
): ExportRow[] {
  return getAttendanceHistory(events, 12, anchor).map((row) => ({
    [cols.month]: row.month,
    [cols.attendanceRate]: row.taxa,
    [cols.completed]: row.realizadas,
    [cols.absences]: row.faltas,
  }))
}

function buildReportCurrentMonthRows(
  patients: Patient[],
  events: CalendarEvent[],
  ctx: ClinicExportContext,
  cols: ColumnLabels,
  anchor = new Date()
): ExportRow[] {
  const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const rows: ExportRow[] = []
  const { t, locale } = ctx

  const attendance = getAttendanceSummary(events, month, anchor)
  rows.push({
    [cols.group]: t("exportSheets.reportGroups.attendance"),
    [cols.item]: formatMonthLabel(month, locale),
    [cols.value1]: `${attendance.rate}%`,
    [cols.value2]: attendance.realizada,
    [cols.value3]: attendance.faltou,
    [cols.value4]: attendance.evaluated,
  })

  for (const row of getAttendanceByModality(events, patients, month, anchor)) {
    rows.push({
      [cols.group]: t("exportSheets.reportGroups.modality"),
      [cols.item]: getModalityLabel(t, row.modality),
      [cols.value1]: `${row.rate}%`,
      [cols.value2]: row.realizada,
      [cols.value3]: row.faltou,
      [cols.value4]: row.total,
    })
  }

  for (const row of getSessionOutcomeBreakdown(events, month, anchor)) {
    rows.push({
      [cols.group]: t("exportSheets.reportGroups.outcome"),
      [cols.item]: getSessionStatusLabel(t, row.status),
      [cols.value1]: row.count,
      [cols.value2]: `${row.pct}%`,
      [cols.value3]: "",
      [cols.value4]: "",
    })
  }

  for (const row of getRevenueByModality(events, patients, month)) {
    rows.push({
      [cols.group]: t("exportSheets.reportGroups.billableRevenue"),
      [cols.item]: getModalityLabel(t, row.modality as PatientModality),
      [cols.value1]: formatLocaleCurrency(row.value, locale),
      [cols.value2]: "",
      [cols.value3]: "",
      [cols.value4]: "",
    })
  }

  return rows
}

function sheetName(ctx: ClinicExportContext, key: ExportSheetKey) {
  return ctx.t(`exportSheets.sheets.${key}`)
}

function buildStyledSheetConfigs(
  data: ClinicExportData,
  ctx: ClinicExportContext,
  anchor = new Date()
): StyledSheetConfig[] {
  const cols = buildColumnLabels(ctx.t)
  const yesLabel = ctx.t("common.yes")
  const emptyLabel = ctx.t("export.sheetsView.empty")
  const recordWrapColumns = [cols.evolution, cols.summary, cols.plan]

  return [
    {
      name: sheetName(ctx, "summary"),
      sheetKey: "summary",
      rows: buildSummaryRows(data, ctx, cols, anchor),
      metricColumn: cols.metric,
      emptyLabel,
    },
    {
      name: sheetName(ctx, "patients"),
      sheetKey: "patients",
      rows: buildPatientsRows(data.patients, data.events, ctx, cols),
      overdueColumn: cols.overdue,
      yesLabel,
      patientStatusColumn: cols.status,
      patientStatusKey: "_patientStatus",
      emptyLabel,
    },
    {
      name: sheetName(ctx, "schedules"),
      sheetKey: "schedules",
      rows: buildSchedulesRows(data.patients, ctx, cols),
      emptyLabel,
    },
    {
      name: sheetName(ctx, "agenda"),
      sheetKey: "agenda",
      rows: buildAgendaRows(data.patients, data.events, ctx, cols),
      sessionStatusKey: "_sessionStatus",
      emptyLabel,
    },
    {
      name: sheetName(ctx, "records"),
      sheetKey: "records",
      rows: buildRecordsRows(data.patients, data.sessionNotes, ctx, cols),
      wrapColumns: recordWrapColumns,
      emptyLabel,
    },
    {
      name: sheetName(ctx, "financePatients"),
      sheetKey: "financePatients",
      rows: buildFinancePatientRows(data.patients, data.events, ctx, cols),
      overdueColumn: cols.overdue,
      yesLabel,
      patientStatusColumn: cols.status,
      patientStatusKey: "_patientStatus",
      emptyLabel,
    },
    {
      name: sheetName(ctx, "financeSessions"),
      sheetKey: "financeSessions",
      rows: buildFinanceSessionRows(data.patients, data.events, ctx, cols, anchor),
      sessionStatusKey: "_sessionStatus",
      overdueColumn: cols.overduePayment,
      yesLabel,
      emptyLabel,
    },
    {
      name: sheetName(ctx, "reportHistory"),
      sheetKey: "reportHistory",
      rows: buildReportHistoryRows(data.events, cols, anchor),
      emptyLabel,
    },
    {
      name: sheetName(ctx, "reportCurrentMonth"),
      sheetKey: "reportCurrentMonth",
      rows: buildReportCurrentMonthRows(
        data.patients,
        data.events,
        ctx,
        cols,
        anchor
      ),
      emptyLabel,
    },
  ]
}

export function buildClinicSheets(
  data: ClinicExportData,
  context: ClinicExportContext,
  anchor = new Date()
): StyledSheetConfig[] {
  return buildStyledSheetConfigs(data, context, anchor)
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

export async function exportClinicXlsx(
  data: ClinicExportData,
  context: ClinicExportContext
) {
  const buffer = await buildStyledWorkbookBuffer(
    buildStyledSheetConfigs(data, context)
  )
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    exportFilename("xlsx")
  )
}
