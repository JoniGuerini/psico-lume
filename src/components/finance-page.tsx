import { useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
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
import { getScheduledPatients, parsePrice } from "@/data/patients"
import type { PatientModality } from "@/data/types"
import {
  getMonthlyFinanceSummary,
  getMonthlyRevenueHistory,
  getRevenueByModality,
  getTopPatientsByRevenue,
} from "@/lib/finance-metrics"
import {
  formatLocaleCurrency,
  formatLocaleCurrencyCompact,
  getModalityLabel,
} from "@/lib/i18n-helpers"
import { LUME_PAGE_CONTENT_CLASS } from "@/lib/design-system"
import { cn } from "@/lib/utils"

const WEEKS_PER_MONTH = 4.33

const modalityColor: Record<PatientModality, string> = {
  presencial: "var(--chart-1)",
  online: "var(--chart-2)",
  hibrido: "var(--chart-3)",
}

export function FinancePage({ onNewPatient }: { onNewPatient?: () => void } = {}) {
  const { t, locale } = useTranslation()
  const { patients, events } = useClinicData()
  const [range, setRange] = useState("12")

  const revenueConfig = useMemo(
    () =>
      ({
        receita: {
          label: t("finance.chartLabels.revenue"),
          color: "var(--chart-1)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const modalityConfig = useMemo(
    () =>
      ({
        value: { label: t("finance.chartLabels.revenue") },
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

  const scheduled = useMemo(() => getScheduledPatients(patients), [patients])

  const monthlySummary = useMemo(
    () => getMonthlyFinanceSummary(events, patients),
    [events, patients]
  )

  const weeklyRevenue = useMemo(
    () =>
      scheduled.reduce((sum, patient) => sum + parsePrice(patient.price), 0),
    [scheduled]
  )

  const avgTicket = monthlySummary.billableCount
    ? Math.round(monthlySummary.total / monthlySummary.billableCount)
    : scheduled.length
      ? Math.round(weeklyRevenue / scheduled.length)
      : 0

  const history = useMemo(
    () => getMonthlyRevenueHistory(events, patients, 12, locale),
    [events, patients, locale]
  )

  const historySlice = useMemo(
    () => history.slice(-Number(range)),
    [history, range]
  )

  const deltaPct = useMemo(() => {
    if (history.length < 2) return 0
    const last = history[history.length - 1].receita
    const prev = history[history.length - 2].receita
    if (prev === 0) return 0
    return ((last - prev) / prev) * 100
  }, [history])

  const modalityData = useMemo(() => {
    return getRevenueByModality(events, patients).map((item) => ({
      key: item.modality as PatientModality,
      label: getModalityLabel(t, item.modality as PatientModality),
      value: item.value,
    }))
  }, [events, patients, t])

  const modalityTotal = modalityData.reduce((sum, item) => sum + item.value, 0)

  const topPatients = useMemo(
    () => getTopPatientsByRevenue(events, patients),
    [events, patients]
  )

  const receivedPct = monthlySummary.total
    ? Math.round((monthlySummary.received / monthlySummary.total) * 100)
    : 0

  const kpis = useMemo(
    () =>
      [
        {
          label: t("finance.kpis.monthRevenue"),
          value: formatLocaleCurrency(monthlySummary.total, locale),
          hint: t("finance.kpis.billableSessions", {
            count: monthlySummary.billableCount,
          }),
          delta: deltaPct,
        },
        {
          label: t("finance.kpis.received"),
          value: formatLocaleCurrency(monthlySummary.received, locale),
          hint: t("finance.kpis.receivedPct", { pct: receivedPct }),
        },
        {
          label: t("finance.kpis.pending"),
          value: formatLocaleCurrency(monthlySummary.pending, locale),
          hint:
            monthlySummary.overdue > 0
              ? t("finance.kpis.overdueAmount", {
                  amount: formatLocaleCurrency(monthlySummary.overdue, locale),
                })
              : t("finance.kpis.onTrack"),
          tone: monthlySummary.overdue > 0 ? ("attention" as const) : undefined,
        },
        {
          label: t("finance.kpis.avgTicket"),
          value: formatLocaleCurrency(avgTicket, locale),
          hint: t("finance.kpis.forecastSessions", {
            count: Math.round(scheduled.length * WEEKS_PER_MONTH),
          }),
        },
      ] as const,
    [
      avgTicket,
      deltaPct,
      locale,
      monthlySummary,
      receivedPct,
      scheduled.length,
      t,
    ]
  )

  if (patients.length === 0) {
    return (
      <NoPatientsEmptyPage
        onNewPatient={onNewPatient}
        description={t("finance.emptyDescription")}
      />
    )
  }

  return (
    <div className={LUME_PAGE_CONTENT_CLASS}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t("finance.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("finance.subtitle")}</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="border-border bg-card shadow-sm hover:bg-accent sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">{t("finance.range.months3")}</SelectItem>
            <SelectItem value="6">{t("finance.range.months6")}</SelectItem>
            <SelectItem value="12">{t("finance.range.months12")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="gap-2 p-5">
            <span className="text-sm text-muted-foreground">{kpi.label}</span>
            <span
              className={cn(
                "font-heading text-2xl font-semibold tracking-tight tabular-nums",
                "tone" in kpi && kpi.tone === "attention" && "text-attention"
              )}
            >
              {kpi.value}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              {"delta" in kpi && kpi.delta !== undefined ? (
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
                  {Math.abs(kpi.delta).toFixed(1)}%
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
              {t("finance.charts.revenueHistory")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("finance.charts.revenueHistoryHint")}
            </p>
          </div>
          <Badge variant="outline" className="border-border bg-background/40">
            <Wallet className="size-3.5" />
            {t("finance.charts.thisMonth", {
              amount: formatLocaleCurrency(monthlySummary.total, locale),
            })}
          </Badge>
        </div>
        <ChartContainer
          config={revenueConfig}
          className="aspect-auto h-[280px] min-h-[280px] w-full min-w-0 shrink-0"
        >
          <AreaChart
            data={historySlice}
            margin={{ left: 12, right: 12, top: 8 }}
          >
            <defs>
              <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-receita)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-receita)"
                  stopOpacity={0.03}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) =>
                    formatLocaleCurrency(Number(value), locale)
                  }
                />
              }
            />
            <Area
              dataKey="receita"
              type="monotone"
              stroke="var(--color-receita)"
              strokeWidth={2}
              fill="url(#fillReceita)"
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      <Card className="gap-4 p-6">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              {t("finance.charts.revenueByModality")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("finance.charts.revenueByModalityHint")}
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
            <ChartContainer
              config={modalityConfig}
              className="aspect-square h-[200px] min-h-[200px] w-[200px] shrink-0"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="key" hideLabel />}
                />
                <Pie
                  data={modalityData}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={52}
                  strokeWidth={4}
                >
                  {modalityData.map((entry) => (
                    <Cell key={entry.key} fill={modalityColor[entry.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex min-w-0 w-full flex-1 flex-col gap-3">
              {modalityData.map((item) => {
                const pct = modalityTotal
                  ? Math.round((item.value / modalityTotal) * 100)
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
        </Card>

      <Card className="gap-0 p-6">
        <div className="flex flex-col pb-2">
          <h3 className="font-heading text-base font-semibold">
            {t("finance.charts.topPatients")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("finance.charts.topPatientsHint")}
          </p>
        </div>
        <div className="divide-y divide-border">
          {topPatients.map(({ patient, total }, index) => (
            <div key={patient.id} className="flex items-center gap-3 py-3">
              <span className="w-5 text-center font-heading text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {patient.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("finance.charts.sessionsPerSession", {
                    count: patient.sessions,
                    price: formatLocaleCurrency(parsePrice(patient.price), locale),
                  })}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-border bg-background/40 tabular-nums"
              >
                {formatLocaleCurrencyCompact(total, locale)}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
