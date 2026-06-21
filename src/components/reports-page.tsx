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
import { modalityLabel } from "@/components/patients-page"
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
import type { PatientModality, SessionStatus } from "@/data/types"
import {
  getAttendanceByModality,
  getAttendanceHistory,
  getAttendanceSummary,
  getReportMonthOptions,
  getRevenueByModality,
  getSessionOutcomeBreakdown,
  parseReportMonth,
} from "@/lib/report-metrics"
import { sessionStatusConfig } from "@/lib/session-status"
import { cn } from "@/lib/utils"

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const modalityColor: Record<PatientModality, string> = {
  presencial: "var(--chart-1)",
  online: "var(--chart-2)",
  hibrido: "var(--chart-3)",
}

const attendanceTrendConfig = {
  taxa: { label: "Comparecimento", color: "var(--chart-1)" },
} satisfies ChartConfig

const modalityAttendanceConfig = {
  taxa: { label: "Taxa", color: "var(--chart-2)" },
} satisfies ChartConfig

const modalityRevenueConfig = {
  value: { label: "Receita" },
  presencial: { label: "Presencial", color: "var(--chart-1)" },
  online: { label: "Remoto", color: "var(--chart-2)" },
  hibrido: { label: "Híbrido", color: "var(--chart-3)" },
} satisfies ChartConfig

const outcomeColors: Record<SessionStatus, string> = {
  agendada: "var(--muted-foreground)",
  realizada: "var(--sidebar-primary)",
  faltou: "var(--destructive)",
  remarcada: "var(--primary)",
  cancelada: "var(--muted-foreground)",
}

export function ReportsPage({ onNewPatient }: { onNewPatient?: () => void } = {}) {
  const { events, patients } = useClinicData()
  const monthOptions = useMemo(() => getReportMonthOptions(), [])
  const [monthValue, setMonthValue] = useState(monthOptions[0]?.value ?? "")
  const [historyRange, setHistoryRange] = useState("12")

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
      label: modalityLabel[item.modality as PatientModality],
      value: item.value,
    }))
  }, [events, patients, selectedMonth])

  const modalityRevenueTotal = modalityRevenue.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const history = useMemo(() => getAttendanceHistory(events), [events])
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

  const kpis = [
    {
      label: "Taxa de comparecimento",
      value: summary.evaluated ? `${summary.rate}%` : "—",
      hint: summary.evaluated
        ? `${summary.realizada} de ${summary.evaluated} sessões`
        : "Sem sessões avaliadas no mês",
      delta: summary.evaluated ? deltaPct : undefined,
      icon: UserCheck,
    },
    {
      label: "Sessões realizadas",
      value: String(summary.realizada),
      hint: "Comparecimentos confirmados",
      icon: UserCheck,
    },
    {
      label: "Faltas",
      value: String(summary.faltou),
      hint: "Ausências registradas",
      tone: summary.faltou > 0 ? ("destructive" as const) : undefined,
      icon: UserX,
    },
    {
      label: "Receita cobrável",
      value: brl.format(modalityRevenueTotal),
      hint: "Por modalidade no mês",
      icon: BarChart3,
    },
  ]

  if (patients.length === 0) {
    return (
      <NoPatientsEmptyPage
        onNewPatient={onNewPatient}
        description="Cadastre pacientes e registre sessões para visualizar comparecimento e receita nos relatórios."
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Relatórios</h2>
          <p className="text-sm text-muted-foreground">
            Comparecimento e receita por modalidade com base nas sessões passadas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={monthValue} onValueChange={setMonthValue}>
            <SelectTrigger className="border-border bg-card shadow-sm hover:bg-accent sm:w-52">
              <SelectValue placeholder="Mês" />
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
              <SelectItem value="3">Tendência 3 meses</SelectItem>
              <SelectItem value="6">Tendência 6 meses</SelectItem>
              <SelectItem value="12">Tendência 12 meses</SelectItem>
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
                kpi.tone === "destructive" && "text-destructive"
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
                  {Math.abs(kpi.delta).toFixed(0)} p.p.
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
              Evolução do comparecimento
            </h3>
            <p className="text-sm text-muted-foreground">
              Taxa mensal de sessões realizadas sobre realizadas + faltas
            </p>
          </div>
          <Badge variant="outline" className="border-border bg-background/40">
            {summary.evaluated ? `${summary.rate}%` : "—"} no mês selecionado
          </Badge>
        </div>
        <ChartContainer
          config={attendanceTrendConfig}
          className="aspect-auto h-[280px] w-full"
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
                      `${value}% (${payload.realizadas} realizadas · ${payload.faltas} faltas)`,
                      "Comparecimento",
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
              Comparecimento por modalidade
            </h3>
            <p className="text-sm text-muted-foreground">
              Taxa de presença no mês por tipo de atendimento
            </p>
          </div>
          {modalityAttendance.length > 0 ? (
            <ChartContainer
              config={modalityAttendanceConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart
                data={modalityAttendance.map((row) => ({
                  modality: modalityLabel[row.modality],
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
                          `${value}% · ${payload.realizada} realizadas · ${payload.faltou} faltas`,
                          "Taxa",
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
              Nenhuma sessão passada com status realizado ou falta neste mês.
            </p>
          )}
        </Card>

        <Card className="gap-4 p-6">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              Receita por modalidade
            </h3>
            <p className="text-sm text-muted-foreground">
              Sessões cobráveis do mês por tipo de atendimento
            </p>
          </div>
          {modalityRevenue.length > 0 ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ChartContainer
                config={modalityRevenueConfig}
                className="aspect-square h-[200px]"
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
              <div className="flex w-full flex-1 flex-col gap-3">
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
                        {brl.format(item.value)}
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
              Nenhuma receita cobrável registrada neste mês.
            </p>
          )}
        </Card>
      </div>

      <Card className="gap-0 p-6">
        <div className="flex flex-col pb-4">
          <h3 className="font-heading text-base font-semibold">
            Desfecho das sessões
          </h3>
          <p className="text-sm text-muted-foreground">
            Distribuição de status nas sessões já ocorridas no mês
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
                    {sessionStatusConfig[row.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.count} sessões · {row.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma sessão passada registrada neste mês.
          </p>
        )}
      </Card>
    </div>
  )
}
