import { useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
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
import { getScheduledPatients, parsePrice } from "@/data/patients"
import type { PatientModality } from "@/data/types"
import {
  getMonthlyFinanceSummary,
  getMonthlyRevenueHistory,
  getRevenueByApproach,
  getRevenueByModality,
  getTopPatientsByRevenue,
} from "@/lib/finance-metrics"
import { cn } from "@/lib/utils"

const WEEKS_PER_MONTH = 4.33

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
})

const modalityColor: Record<PatientModality, string> = {
  presencial: "var(--chart-1)",
  online: "var(--chart-2)",
  hibrido: "var(--chart-3)",
}

const revenueConfig = {
  receita: { label: "Receita", color: "var(--chart-1)" },
} satisfies ChartConfig

const approachConfig = {
  receita: { label: "Receita", color: "var(--chart-2)" },
} satisfies ChartConfig

const modalityConfig = {
  value: { label: "Receita" },
  presencial: { label: "Presencial", color: "var(--chart-1)" },
  online: { label: "Remoto", color: "var(--chart-2)" },
  hibrido: { label: "Híbrido", color: "var(--chart-3)" },
} satisfies ChartConfig

export function FinancePage({ onNewPatient }: { onNewPatient?: () => void } = {}) {
  const { patients, events } = useClinicData()
  const [range, setRange] = useState("12")

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
    () => getMonthlyRevenueHistory(events, patients),
    [events, patients]
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
      label: modalityLabel[item.modality as PatientModality],
      value: item.value,
    }))
  }, [events, patients])

  const modalityTotal = modalityData.reduce((sum, item) => sum + item.value, 0)

  const approachData = useMemo(
    () => getRevenueByApproach(events, patients),
    [events, patients]
  )

  const topPatients = useMemo(
    () => getTopPatientsByRevenue(events, patients),
    [events, patients]
  )

  const receivedPct = monthlySummary.total
    ? Math.round((monthlySummary.received / monthlySummary.total) * 100)
    : 0

  const kpis: {
    label: string
    value: string
    hint: string
    delta?: number
    tone?: "destructive"
  }[] = [
    {
      label: "Receita do mês",
      value: brl.format(monthlySummary.total),
      hint: `${monthlySummary.billableCount} sessões cobráveis`,
      delta: deltaPct,
    },
    {
      label: "Recebido",
      value: brl.format(monthlySummary.received),
      hint: `${receivedPct}% do faturado`,
    },
    {
      label: "A receber",
      value: brl.format(monthlySummary.pending),
      hint:
        monthlySummary.overdue > 0
          ? `${brl.format(monthlySummary.overdue)} em atraso`
          : "Em dia",
      tone: monthlySummary.overdue > 0 ? "destructive" : undefined,
    },
    {
      label: "Ticket médio",
      value: brl.format(avgTicket),
      hint: `${Math.round(scheduled.length * WEEKS_PER_MONTH)} sessões previstas`,
    },
  ]

  if (patients.length === 0) {
    return (
      <NoPatientsEmptyPage
        onNewPatient={onNewPatient}
        description="Cadastre seu primeiro paciente para começar a acompanhar receitas e indicadores financeiros."
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus ganhos, recebimentos e indicadores da clínica.
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="border-border bg-card shadow-sm hover:bg-accent sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
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
              Histórico de receita
            </h3>
            <p className="text-sm text-muted-foreground">
              Evolução mensal dos ganhos
            </p>
          </div>
          <Badge variant="outline" className="border-border bg-background/40">
            <Wallet className="size-3.5" />
            {brl.format(monthlySummary.total)} este mês
          </Badge>
        </div>
        <ChartContainer
          config={revenueConfig}
          className="aspect-auto h-[280px] w-full"
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
                  formatter={(value) => brl.format(Number(value))}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 p-6">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              Receita por modalidade
            </h3>
            <p className="text-sm text-muted-foreground">
              Distribuição mensal por tipo de atendimento
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ChartContainer
              config={modalityConfig}
              className="aspect-square h-[200px]"
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
            <div className="flex w-full flex-1 flex-col gap-3">
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
        </Card>

        <Card className="gap-4 p-6">
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-semibold">
              Receita por abordagem
            </h3>
            <p className="text-sm text-muted-foreground">
              Quanto cada linha de trabalho representa por mês
            </p>
          </div>
          <ChartContainer
            config={approachConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <BarChart data={approachData} margin={{ top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="approach"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => brl.format(Number(value))}
                  />
                }
              />
              <Bar dataKey="receita" fill="var(--color-receita)" radius={8} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      <Card className="gap-0 p-6">
        <div className="flex flex-col pb-2">
          <h3 className="font-heading text-base font-semibold">
            Faturamento por paciente
          </h3>
          <p className="text-sm text-muted-foreground">
            Acompanhamentos com maior faturamento acumulado
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
                  {patient.sessions} sessões ·{" "}
                  {brl.format(parsePrice(patient.price))}/sessão
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-border bg-background/40 tabular-nums"
              >
                {brlCompact.format(total)}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
