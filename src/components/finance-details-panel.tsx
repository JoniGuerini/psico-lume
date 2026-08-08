import { useMemo, useState, type ReactNode } from "react"
import { ArrowLeft, Table2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import {
  getFinancePatientDetailRows,
  getFinancePeriodDetailRows,
  getFinanceSessionDetailRows,
  getMonthlyFinanceSummary,
} from "@/lib/finance-metrics"
import {
  formatLocaleCurrency,
  formatLocaleDate,
  getModalityLabel,
  getSessionStatusLabel,
} from "@/lib/i18n-helpers"
import {
  getReportMonthOptions,
  parseReportMonth,
} from "@/lib/report-metrics"
import { getEventStatus } from "@/lib/session-status"
import { cn } from "@/lib/utils"

type FinanceDetailsPanelProps = {
  onBack: () => void
}

export function FinanceDetailsPanel({ onBack }: FinanceDetailsPanelProps) {
  const { t, locale } = useTranslation()
  const { patients, events } = useClinicData()
  const [tab, setTab] = useState("sessions")

  const monthOptions = useMemo(
    () => getReportMonthOptions(12, new Date(), locale),
    [locale]
  )
  const [monthValue, setMonthValue] = useState(
    () => monthOptions[0]?.value ?? ""
  )

  const month = useMemo(
    () => (monthValue ? parseReportMonth(monthValue) : new Date()),
    [monthValue]
  )

  const monthLabel = useMemo(() => {
    const option = monthOptions.find((item) => item.value === monthValue)
    if (option) return option.label
    const raw = formatLocaleDate(month, locale, {
      month: "long",
      year: "numeric",
    })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [locale, month, monthOptions, monthValue])

  const summary = useMemo(
    () => getMonthlyFinanceSummary(events, patients, month),
    [events, patients, month]
  )

  const sessionRows = useMemo(
    () => getFinanceSessionDetailRows(events, patients, month),
    [events, patients, month]
  )

  const patientRows = useMemo(
    () => getFinancePatientDetailRows(events, patients, month),
    [events, patients, month]
  )

  const periodRows = useMemo(
    () => getFinancePeriodDetailRows(events, patients, month),
    [events, patients, month]
  )

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border bg-card hover:bg-accent/50"
              onClick={onBack}
            >
              <ArrowLeft />
              {t("finance.details.back")}
            </Button>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("finance.details.title")}
          </h2>
          <p className="max-w-2xl text-sm text-foreground/70">
            {t("finance.details.description", { month: monthLabel })}
          </p>
        </div>
        <Select value={monthValue} onValueChange={setMonthValue}>
          <SelectTrigger className="border-border bg-card shadow-none hover:bg-accent/50 sm:w-52">
            <SelectValue placeholder={t("finance.details.monthPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option, index) => (
              <SelectItem key={option.value} value={option.value}>
                {index === 0
                  ? t("finance.details.monthCurrent")
                  : index === 1
                    ? t("finance.details.monthPrevious")
                    : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryChip
          label={t("finance.kpis.monthRevenue")}
          value={formatLocaleCurrency(summary.total, locale)}
        />
        <SummaryChip
          label={t("finance.kpis.received")}
          value={formatLocaleCurrency(summary.received, locale)}
        />
        <SummaryChip
          label={t("finance.kpis.pending")}
          value={formatLocaleCurrency(summary.pending, locale)}
        />
        <SummaryChip
          label={t("finance.details.billableCount")}
          value={String(summary.billableCount)}
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
      >
        <TabsList className="shrink-0 self-start border border-border bg-card">
          <TabsTrigger value="sessions">
            {t("finance.details.tabs.sessions")}
          </TabsTrigger>
          <TabsTrigger value="patients">
            {t("finance.details.tabs.patients")}
          </TabsTrigger>
          <TabsTrigger value="periods">
            {t("finance.details.tabs.periods")}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="sessions"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
        >
          {sessionRows.length === 0 ? (
            <EmptyState text={t("finance.details.emptySessions")} />
          ) : (
            <ScrollableTable>
              <Table>
                <StickyHeader>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.date")}
                  </TableHead>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.patient")}
                  </TableHead>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.status")}
                  </TableHead>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.modality")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.amount")}
                  </TableHead>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.payment")}
                  </TableHead>
                </StickyHeader>
                <TableBody>
                  {sessionRows.map((row) => {
                    const status = getEventStatus(row.event)
                    return (
                      <TableRow key={row.event.id}>
                        <TableCell className="whitespace-nowrap text-foreground tabular-nums">
                          {formatLocaleDate(row.event.date, locale, {
                            day: "2-digit",
                            month: "short",
                          })}
                          <span className="text-foreground/60">
                            {" "}
                            · {row.event.start}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[12rem] truncate font-medium text-foreground">
                          {row.patient.name}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {getSessionStatusLabel(t, status)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {getModalityLabel(t, row.modality)}
                        </TableCell>
                        <TableCell className="text-right text-foreground tabular-nums">
                          {formatLocaleCurrency(row.amount, locale)}
                        </TableCell>
                        <TableCell>
                          <PaymentBadge
                            paid={row.paid}
                            overdue={row.overdue}
                            paidLabel={t("finance.details.payment.paid")}
                            pendingLabel={t("finance.details.payment.pending")}
                            overdueLabel={t("finance.details.payment.overdue")}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollableTable>
          )}
        </TabsContent>

        <TabsContent
          value="patients"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
        >
          {patientRows.length === 0 ? (
            <EmptyState text={t("finance.details.emptyPatients")} />
          ) : (
            <ScrollableTable>
              <Table>
                <StickyHeader>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.patient")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.sessions")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.received")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.pending")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.total")}
                  </TableHead>
                </StickyHeader>
                <TableBody>
                  {patientRows.map((row) => (
                    <TableRow key={row.patient.id}>
                      <TableCell className="max-w-[14rem] truncate font-medium text-foreground">
                        {row.patient.name}
                        {row.overdueCount > 0 ? (
                          <span className="mt-0.5 block text-xs font-medium text-attention">
                            {t("finance.details.overdueSessions", {
                              count: row.overdueCount,
                            })}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {row.billableCount}
                        <span className="text-foreground/60">
                          {" "}
                          ({row.paidCount}/{row.unpaidCount})
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {formatLocaleCurrency(row.received, locale)}
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {formatLocaleCurrency(row.pending, locale)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground tabular-nums">
                        {formatLocaleCurrency(row.total, locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollableTable>
          )}
        </TabsContent>

        <TabsContent
          value="periods"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
        >
          {periodRows.length === 0 ? (
            <EmptyState text={t("finance.details.emptyPeriods")} />
          ) : (
            <ScrollableTable>
              <Table>
                <StickyHeader>
                  <TableHead className="bg-card font-medium text-foreground/80">
                    {t("finance.details.columns.period")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.sessions")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.received")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.pending")}
                  </TableHead>
                  <TableHead className="bg-card text-right font-medium text-foreground/80">
                    {t("finance.details.columns.total")}
                  </TableHead>
                </StickyHeader>
                <TableBody>
                  {periodRows.map((row) => (
                    <TableRow
                      key={`${row.date.getFullYear()}-${row.date.getMonth()}-${row.date.getDate()}`}
                    >
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {formatLocaleDate(row.date, locale, {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                        {row.overdueCount > 0 ? (
                          <span className="mt-0.5 block text-xs font-medium text-attention">
                            {t("finance.details.overdueSessions", {
                              count: row.overdueCount,
                            })}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {row.billableCount}
                        <span className="text-foreground/60">
                          {" "}
                          ({row.paidCount}/{row.unpaidCount})
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {formatLocaleCurrency(row.received, locale)}
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {formatLocaleCurrency(row.pending, locale)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground tabular-nums">
                        {formatLocaleCurrency(row.total, locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollableTable>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScrollableTable({ children }: { children: ReactNode }) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain">
        {children}
      </div>
    </Card>
  )
}

function StickyHeader({ children }: { children: ReactNode }) {
  return (
    <TableHeader>
      <TableRow className="border-b border-border hover:bg-transparent [&_th]:sticky [&_th]:top-0 [&_th]:z-20 [&_th]:bg-card [&_th]:shadow-[inset_0_-1px_0_0_var(--border)]">
        {children}
      </TableRow>
    </TableHeader>
  )
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-xs font-medium text-foreground/70">{label}</p>
      <p className="font-heading text-xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="flex min-h-0 flex-1 items-center justify-center border-dashed px-6 py-10 text-center text-sm text-foreground/70">
      {text}
    </Card>
  )
}

function PaymentBadge({
  paid,
  overdue,
  paidLabel,
  pendingLabel,
  overdueLabel,
}: {
  paid: boolean
  overdue: boolean
  paidLabel: string
  pendingLabel: string
  overdueLabel: string
}) {
  if (paid) {
    return (
      <Badge
        variant="outline"
        className="border-border bg-muted/50 font-medium text-foreground"
      >
        {paidLabel}
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        overdue
          ? "border-attention/40 bg-attention/15 text-attention"
          : "border-border bg-muted/50 text-foreground"
      )}
    >
      {overdue ? overdueLabel : pendingLabel}
    </Badge>
  )
}

export function FinanceDetailsButton({
  onClick,
}: {
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-border bg-card hover:bg-accent/50"
      onClick={onClick}
    >
      <Table2 />
      {t("finance.details.open")}
    </Button>
  )
}
