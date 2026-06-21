import { useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  UserCheck,
  UserX,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { NoPatientsEmptyPage } from "@/components/no-patients-empty-page"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import type { PatientModality, SessionStatus } from "@/data/types"
import {
  formatLocaleCurrency,
  getModalityLabel,
  getSessionStatusLabel,
} from "@/lib/i18n-helpers"
import {
  getAttendanceByModality,
  getAttendanceHistory,
  getAttendanceSummary,
  getReportMonthOptions,
  getRevenueByModality,
  getSessionOutcomeBreakdown,
  parseReportMonth,
} from "@/lib/report-metrics"
import { LUME_PAGE_CONTENT_CLASS } from "@/lib/design-system"
import { cn } from "@/lib/utils"

const modalityColor: Record<PatientModality, string> = {
  presencial: "var(--chart-1)",
  online: "var(--chart-2)",
  hibrido: "var(--chart-3)",
}

const outcomeColors: Record<SessionStatus, string> = {
  agendada: "var(--muted-foreground)",
  realizada: "var(--sidebar-primary)",
  faltou: "var(--attention)",
  remarcada: "var(--primary)",
  cancelada: "var(--muted-foreground)",
}

export function ReportsPage({ onNewPatient }: { onNewPatient?: () => void } = {}) {
  const { t, locale } = useTranslation()
  const { events, patients } = useClinicData()
  const monthOptions = useMemo(
    () => getReportMonthOptions(12, new Date(), locale),
    [locale]
  )
  const [monthValue, setMonthValue] = useState(monthOptions[0]?.value ?? "")
  const [historyRange, setHistoryRange] = useState("12")

  const attendanceTrendConfig = useMemo(
    () =>
      ({
        taxa: {
          label: t("reports.chartLabels.attendance"),
          color: "var(--chart-1)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const modalityAttendanceConfig = useMemo(
    () =>
      ({
        taxa: { label: t("reports.chartLabels.rate"), color: "var(--chart-2)" },
      }) satisfies ChartConfig,
    [t]
  )

  const modalityRevenueConfig = useMemo(
    () =>
      ({
        value: { label: t("reports.chartLabels.revenue") },
        presencial: {
          label: getModalityLabel(t, "presencial"),
          color: "var(--chart-1)",
        },
        online: {
          label: getModalityLabel(t, "online"),
          color: "var(--chart-2)",
        },
        hibrido: {
          label: getModalityLabel(t, "hibrido"),
          color: "var(--chart-3)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const selectedMonth = useMemo(
    () => parseReportMonth(monthValue),
    [monthValue]
  )

  const summary = useMemo(
    () => getAttendanceSummary(events, selectedMonth),
    [events, selectedMonth]
  )

  const modalityAttendance = useMemo(
    () => getAttendanceByModality(events, patients, selectedMonth),
    [events, patients, selectedMonth]
  )

  const modalityRevenue = useMemo(() => {
    return getRevenueByModality(events, patients, selectedMonth).map((item) => ({
      key: item.modality as PatientModality,
      label: getModalityLabel(t, item.modality as PatientModality),
      value: item.value,
    }))
  }, [events, patients, selectedMonth, t])

  const modalityRevenueTotal = modalityRevenue.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const history = useMemo(
    () => getAttendanceHistory(events, 12, new Date(), locale),
    [events, locale]
  )
  const historySlice = useMemo(
    () => history.slice(-Number(historyRange)),
    [history, historyRange]
  )

  const outcomes = useMemo(
    () => getSessionOutcomeBreakdown(events, selectedMonth),
    [events, selectedMonth]
  )

  const deltaPct = useMemo(() => {
    if (history.length < 2) return 0
    const last = history[history.length - 1].taxa
    const prev = history[history.length - 2].taxa
    if (prev === 0) return 0
    return last - prev
  }, [history])

  const kpis = useMemo(
    () => [
      {
        label: t("reports.kpis.attendanceRate"),
        value: summary.evaluated ? `${summary.rate}%` : "—",
        hint: summary.evaluated
          ? t("reports.kpis.sessionsOf", {
              done: summary.realizada,
              total: summary.evaluated,
            })
          : t("reports.kpis.noEvaluated"),
        delta: summary.evaluated ? deltaPct : undefined,
        icon: UserCheck,
      },
      {
        label: t("reports.kpis.completed"),
        value: String(summary.realizada),
        hint: t("reports.kpis.completedHint"),
        icon: UserCheck,
      },
      {
        label: t("reports.kpis.absences"),
        value: String(summary.faltou),
        hint: t("reports.kpis.absencesHint"),
        tone: summary.faltou > 0 ? ("attention" as const) : undefined,
        icon: UserX,
      },
      {
        label: t("reports.kpis.billableRevenue"),
        value: formatLocaleCurrency(modalityRevenueTotal, locale),
        hint: t("reports.kpis.billableRevenueHint"),
        icon: BarChart3,
      },
    ],
    [deltaPct, locale, modalityRevenueTotal, summary, t]
  )

  if (patients.length === 0) {
    return (
      <NoPatientsEmptyPage
        onNewPatient={onNewPatient}
        description={t("reports.emptyDescription")}
      />
    )
  }

  return (
    <div className={LUME_PAGE_CONTENT_CLASS}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t("reports.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("reports.subtitleDetail")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={monthValue} onValueChange={setMonthValue}>
            <SelectTrigger className="border-border bg-card shadow-sm hover:bg-accent sm:w-52">
              <SelectValue placeholder={t("reports.monthPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={historyRange} onValueChange={setHistoryRange}>
            <SelectTrigger className="border-border bg-card shadow-sm hover:bg-accent sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">{t("reports.trendRange.months3")}</SelectItem>
              <SelectItem value="6">{t("reports.trendRange.months6")}</SelectItem>
              <SelectItem value="12">{t("reports.trendRange.months12")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="gap-2 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="size-4 text-muted-foreground" />
            </div>
            <span
              className={cn(
                "font-heading text-2xl font-semibold tracking-tight tabular-nums",
                kpi.tone === "attention" && "text-attention"
              )}
            >
              {kpi.value}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              {kpi.delta !== undefined ? (
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-medium",
                    kpi.delta >= 0 ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {kpi.delta >= 0 ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {Math.abs(kpi.delta).toFixed(0)} {t("reports.deltaPoints")}
                </span>
              ) : null}
              <span className="text-muted-foreground">{kpi.hint}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              {t("reports.charts.attendanceTrend")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("reports.charts.attendanceTrendHint")}
            </p>
          </div>
          <Badge variant="outline" className="border-border bg-background/40">
            {t("reports.charts.selectedMonth", {
              rate: summary.evaluated ? `${summary.rate}%` : "—",
            })}
          </Badge>
        </div>
        <ChartContainer
          config={attendanceTrendConfig}
          className="aspect-auto h-[280px] min-h-[280px] w-full min-w-0 shrink-0"
        >
          <LineChart data={historySlice} margin={{ left: 12, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              width={40}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, _name, item) => {
                    const payload = item.payload as {
                      realizadas: number
                      faltas: number
                    }
                    return [
                      t("reports.charts.tooltipAttendance", {
                        rate: Number(value ?? 0),
                        done: payload.realizadas,
                        missed: payload.faltas,
                      }),
                      t("reports.chartLabels.attendance"),
                    ]
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="taxa"
              stroke="var(--color-taxa)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-taxa)" }}
            />
          </LineChart>
        </ChartContainer>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 p-6">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              {t("reports.charts.attendanceByModality")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("reports.charts.attendanceByModalityHint")}
            </p>
          </div>
          {modalityAttendance.length > 0 ? (
            <ChartContainer
              config={modalityAttendanceConfig}
              className="aspect-auto h-[220px] min-h-[220px] w-full min-w-0 shrink-0"
            >
              <BarChart
                data={modalityAttendance.map((row) => ({
                  modality: getModalityLabel(t, row.modality),
                  taxa: row.rate,
                  realizada: row.realizada,
                  faltou: row.faltou,
                }))}
                margin={{ top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="modality"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const payload = item.payload as {
                          realizada: number
                          faltou: number
                        }
                        return [
                          t("reports.charts.tooltipRate", {
                            rate: Number(value ?? 0),
                            done: payload.realizada,
                            missed: payload.faltou,
                          }),
                          t("reports.chartLabels.rate"),
                        ]
                      }}
                    />
                  }
                />
                <Bar dataKey="taxa" fill="var(--color-taxa)" radius={8} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("reports.empty.noPastSessions")}
            </p>
          )}
        </Card>

        <Card className="gap-4 p-6">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              {t("reports.charts.revenueByModality")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("reports.charts.revenueByModalityHint")}
            </p>
          </div>
          {modalityRevenue.length > 0 ? (
            <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
              <ChartContainer
                config={modalityRevenueConfig}
                className="aspect-square h-[200px] min-h-[200px] w-[200px] shrink-0"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent nameKey="key" hideLabel />}
                  />
                  <Pie
                    data={modalityRevenue}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={52}
                    strokeWidth={4}
                  >
                    {modalityRevenue.map((entry) => (
                      <Cell key={entry.key} fill={modalityColor[entry.key]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex min-w-0 w-full flex-1 flex-col gap-3">
                {modalityRevenue.map((item) => {
                  const pct = modalityRevenueTotal
                    ? Math.round((item.value / modalityRevenueTotal) * 100)
                    : 0
                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: modalityColor[item.key] }}
                      />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="text-sm font-medium tabular-nums">
                        {formatLocaleCurrency(item.value, locale)}
                      </span>
                      <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("reports.empty.noBillableRevenue")}
            </p>
          )}
        </Card>
      </div>

      <Card className="gap-0 p-6">
        <div className="flex flex-col pb-4">
          <h3 className="font-heading text-base font-semibold">
            {t("reports.charts.sessionOutcomes")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("reports.charts.sessionOutcomesHint")}
          </p>
        </div>
        {outcomes.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((row) => (
              <div
                key={row.status}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: outcomeColors[row.status] }}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">
                    {getSessionStatusLabel(t, row.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("reports.charts.outcomeRow", {
                      count: row.count,
                      pct: row.pct,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("reports.empty.noPastSessionsMonth")}
          </p>
        )}
      </Card>
    </div>
  )
}
