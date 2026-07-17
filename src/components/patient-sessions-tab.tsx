import { useMemo } from "react"
import {
  ArrowDown,
  CalendarDays,
  Clock,
  History,
} from "lucide-react"

import { SessionStatusIndicator } from "@/components/session-status-control"
import { Card } from "@/components/ui/card"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { getEventsForPatientProfile } from "@/data/calendar"
import type { CalendarEvent, Patient, RescheduledFrom } from "@/data/types"
import { formatLocaleDate, getModalityLabel } from "@/lib/i18n-helpers"
import { resolveSessionModality } from "@/lib/session-modality"
import { getEventStatus } from "@/lib/session-status"
import { cn } from "@/lib/utils"

type PatientSessionsTabProps = {
  patient: Patient
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" className="gap-1 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
    </Card>
  )
}

function SessionTimeRow({
  date,
  start,
  end,
  locale,
}: {
  date: Date
  start: string
  end: string
  locale: "pt-BR" | "en"
}) {
  const formatted = formatLocaleDate(date, locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const label = formatted.charAt(0).toUpperCase() + formatted.slice(1)

  return (
    <>
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3 shrink-0" />
        {start} – {end}
      </span>
    </>
  )
}

const statusAccent: Record<
  ReturnType<typeof getEventStatus>,
  string
> = {
  agendada: "border-l-border",
  realizada: "border-l-sidebar-primary",
  faltou: "border-l-destructive",
  remarcada: "border-l-primary",
  cancelada: "border-l-muted-foreground",
}

function SessionHistoryCard({
  event,
  patient,
}: {
  event: CalendarEvent
  patient: Patient
}) {
  const { t, locale } = useTranslation()
  const status = getEventStatus(event)
  const modality = resolveSessionModality(event, patient)

  return (
    <Card
      className={cn(
        "gap-3 border border-border border-l-4 bg-card p-4 shadow-sm",
        statusAccent[status]
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <SessionTimeRow
            date={event.date}
            start={event.start}
            end={event.end}
            locale={locale}
          />
          {modality ? (
            <span className="text-xs text-muted-foreground">
              {getModalityLabel(t, modality)}
            </span>
          ) : null}
        </div>
        <SessionStatusIndicator status={status} className="mt-0.5" />
      </div>
    </Card>
  )
}

function RescheduledSessionGroup({ event }: { event: CalendarEvent }) {
  const { t, locale } = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-sm">
      <div
        className={cn(
          "border-b border-border border-l-4 bg-card p-4",
          statusAccent.remarcada
        )}
      >
        <div className="mb-1">
          <span className="text-xs font-medium text-primary">
            {t("patients.sessions.newSession")}
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <SessionTimeRow
              date={event.date}
              start={event.start}
              end={event.end}
              locale={locale}
            />
          </div>
          <SessionStatusIndicator status="remarcada" className="mt-0.5" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-b border-border bg-primary/5 px-4 py-2">
        <ArrowDown className="size-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">
          {t("patients.sessions.rescheduledFrom")}
        </span>
      </div>

      <OriginalSessionCard original={event.rescheduledFrom!} locale={locale} />
    </div>
  )
}

function OriginalSessionCard({
  original,
  locale,
}: {
  original: RescheduledFrom
  locale: "pt-BR" | "en"
}) {
  const { t } = useTranslation()

  return (
    <div className="border-l-4 border-l-muted-foreground/40 bg-muted/30 p-4">
      <div className="mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          {t("patients.sessions.originalSlot")}
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1 opacity-80">
          <SessionTimeRow
            date={original.date}
            start={original.start}
            end={original.end}
            locale={locale}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {t("patients.sessions.replaced")}
        </span>
      </div>
    </div>
  )
}

function SessionHistoryItem({
  event,
  patient,
}: {
  event: CalendarEvent
  patient: Patient
}) {
  if (event.rescheduledFrom && getEventStatus(event) === "remarcada") {
    return <RescheduledSessionGroup event={event} />
  }
  return <SessionHistoryCard event={event} patient={patient} />
}

export function PatientSessionsTab({ patient }: PatientSessionsTabProps) {
  const { t } = useTranslation()
  const { events } = useClinicData()

  const sessions = useMemo(
    () => getEventsForPatientProfile(events, patient.id),
    [events, patient.id]
  )

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let realizadas = 0
    let proximas = 0
    let faltas = 0

    for (const event of sessions) {
      const status = getEventStatus(event)
      if (status === "realizada") realizadas++
      if (status === "faltou" || status === "cancelada") faltas++
      if (
        event.date >= today &&
        (status === "agendada" || status === "remarcada")
      ) {
        proximas++
      }
    }

    return {
      total: sessions.length,
      realizadas,
      proximas,
      faltas,
    }
  }, [sessions])

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 border-transparent bg-sidebar p-5 text-sidebar-foreground sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <History className="size-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold text-surface-navy-heading">
              {t("patients.sessions.title")}
            </h3>
            <p className="text-sm text-sidebar-foreground/75">
              {t("patients.sessions.subtitle", { name: patient.name })}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("patients.sessions.stats.total")}
          value={String(stats.total)}
        />
        <Stat
          label={t("patients.sessions.stats.completed")}
          value={String(stats.realizadas)}
        />
        <Stat
          label={t("patients.sessions.stats.upcoming")}
          value={String(stats.proximas)}
        />
        <Stat
          label={t("patients.sessions.stats.absences")}
          value={String(stats.faltas)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading text-base font-semibold">
            {t("patients.sessions.listTitle")}
          </h4>
          <span className="text-sm text-muted-foreground">
            {t(
              sessions.length === 1
                ? "patients.sessions.record_one"
                : "patients.sessions.record_other",
              { count: sessions.length }
            )}
          </span>
        </div>

        {sessions.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed bg-background/40 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
              <CalendarDays className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">{t("patients.sessions.emptyTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("patients.sessions.emptyDescription")}
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((event) => (
              <SessionHistoryItem
                key={event.id}
                event={event}
                patient={patient}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
