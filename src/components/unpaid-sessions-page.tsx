import { useMemo, useState } from "react"
import {
  AlertCircle,
  Check,
  CheckCheck,
  CircleDollarSign,
  Clock,
  User,
} from "lucide-react"

import { NoPatientsEmptyPage } from "@/components/no-patients-empty-page"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { getInitials } from "@/data/patients"
import {
  formatLocaleCurrency,
  formatLocaleDate,
  getModalityLabel,
} from "@/lib/i18n-helpers"
import { LUME_PAGE_CONTENT_CLASS } from "@/lib/design-system"
import { cn } from "@/lib/utils"

type Filter = "todas" | "atraso"

type UnpaidSessionsPageProps = {
  onOpenPatient?: (patientId: string) => void
  onNewPatient?: () => void
  initialFilter?: Filter
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: "attention"
}) {
  return (
    <Card size="sm" className="gap-1 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-heading text-2xl font-semibold tracking-tight tabular-nums",
          tone === "attention" && "text-attention"
        )}
      >
        {value}
      </span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </Card>
  )
}

export function UnpaidSessionsPage({
  onOpenPatient,
  onNewPatient,
  initialFilter = "todas",
}: UnpaidSessionsPageProps) {
  const { t, locale } = useTranslation()
  const {
    patients,
    unpaidSessions,
    unpaidSessionsTotal,
    markEventPaid,
    markAllEventsPaid,
  } = useClinicData()
  const [filter, setFilter] = useState<Filter>(initialFilter)

  const filtered = useMemo(() => {
    if (filter === "atraso") {
      return unpaidSessions.filter((row) => row.overdue)
    }
    return unpaidSessions
  }, [filter, unpaidSessions])

  const overdueCount = useMemo(
    () => unpaidSessions.filter((row) => row.overdue).length,
    [unpaidSessions]
  )

  const overdueTotal = useMemo(
    () =>
      unpaidSessions
        .filter((row) => row.overdue)
        .reduce((sum, row) => sum + row.amount, 0),
    [unpaidSessions]
  )

  const visibleIds = useMemo(
    () => filtered.map((row) => row.event.id),
    [filtered]
  )

  if (patients.length === 0) {
    return (
      <NoPatientsEmptyPage
        onNewPatient={onNewPatient}
        description={t("receivables.emptyPatientsDescription")}
      />
    )
  }

  return (
    <div
      className={cn(
        LUME_PAGE_CONTENT_CLASS,
        filtered.length === 0 && "min-h-[calc(100svh-5rem-2rem)] flex-1"
      )}
    >
      <Card className="flex flex-col gap-4 border-transparent bg-sidebar p-5 text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <CircleDollarSign className="size-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold text-surface-navy-heading">
              {t("receivables.title")}
            </h2>
            <p className="text-sm text-sidebar-foreground/75">
              {t("receivables.subtitle")}
            </p>
          </div>
        </div>
        {filtered.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-white/20 bg-white/10 text-sidebar-foreground hover:bg-white/15 hover:text-surface-navy-heading"
            onClick={() => markAllEventsPaid(visibleIds)}
          >
            <CheckCheck />
            {t("receivables.markVisiblePaid")}
          </Button>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("receivables.stats.openSessions")}
          value={String(unpaidSessions.length)}
          hint={t("receivables.stats.openSessionsHint")}
        />
        <Stat
          label={t("receivables.stats.totalDue")}
          value={formatLocaleCurrency(unpaidSessionsTotal, locale)}
          hint={t("receivables.stats.totalDueHint")}
        />
        <Stat
          label={t("receivables.stats.overdue")}
          value={String(overdueCount)}
          hint={t("receivables.stats.overdueHint")}
          tone={overdueCount > 0 ? "attention" : undefined}
        />
        <Stat
          label={t("receivables.stats.overdueAmount")}
          value={formatLocaleCurrency(overdueTotal, locale)}
          hint={
            overdueCount > 0
              ? t("receivables.stats.prioritize")
              : t("receivables.stats.noOldPending")
          }
          tone={overdueTotal > 0 ? "attention" : undefined}
        />
      </div>

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
          >
            <TabsList className="h-9 border border-border bg-background/40">
              <TabsTrigger value="todas" className="text-xs">
                {t("receivables.tabs.all")}
                {unpaidSessions.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="ml-1.5 border-border bg-card px-1.5 py-0 text-[10px]"
                  >
                    {unpaidSessions.length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="atraso" className="text-xs">
                {t("receivables.tabs.overdue")}
                {overdueCount > 0 ? (
                  <Badge
                    variant="outline"
                    className="ml-1.5 border-attention/30 bg-attention/10 px-1.5 py-0 text-[10px] text-attention"
                  >
                    {overdueCount}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-sm text-muted-foreground">
            {t(
              filtered.length === 1
                ? "receivables.listed_one"
                : "receivables.listed_other",
              { count: filtered.length }
            )}
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted">
              <Check className="size-5 text-sidebar-primary" />
            </div>
            <div className="flex max-w-md flex-col gap-1">
              <p className="font-medium">
                {filter === "atraso"
                  ? t("receivables.empty.overdueTitle")
                  : t("receivables.empty.allTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {filter === "atraso"
                  ? t("receivables.empty.overdueDescription")
                  : t("receivables.empty.allDescription")}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex min-w-0 flex-col gap-2">
          {filtered.map((row) => (
            <Card
              key={row.event.id}
              className={cn(
                "flex min-w-0 w-full flex-col gap-3 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between",
                row.overdue ? "border-attention/25" : "border-border"
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="bg-sidebar-primary/15 text-sm font-medium text-foreground">
                    {getInitials(row.patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="truncate text-left font-medium hover:underline"
                      onClick={() => onOpenPatient?.(row.patient.id)}
                    >
                      {row.patient.name}
                    </button>
                    {row.overdue ? (
                      <Badge
                        variant="outline"
                        className="border-attention/30 bg-attention/10 font-normal text-attention"
                      >
                        <AlertCircle className="size-3" />
                        {t("receivables.badges.overdue")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border bg-background/40 font-normal"
                      >
                        {t("receivables.badges.pending")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      {formatLocaleDate(row.event.date, locale, {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 shrink-0" />
                      {row.event.start} – {row.event.end}
                    </span>
                    <span>{getModalityLabel(t, row.patient.modality)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {row.daysSince === 0
                      ? t("receivables.doneToday")
                      : row.daysSince === 1
                        ? t("receivables.daysAgo_one")
                        : t("receivables.daysAgo_other", {
                            count: row.daysSince,
                          })}
                  </span>
                </div>
              </div>

              <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center justify-between gap-3 lg:w-auto lg:justify-end">
                <span className="font-heading text-lg font-semibold tabular-nums">
                  {formatLocaleCurrency(row.amount, locale)}
                </span>
                <div className="flex flex-wrap gap-2">
                  {onOpenPatient ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border bg-background/40 hover:bg-accent/50"
                      onClick={() => onOpenPatient(row.patient.id)}
                    >
                      <User />
                      {t("receivables.profile")}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => markEventPaid(row.event.id)}
                  >
                    <Check />
                    {t("receivables.markPaid")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
