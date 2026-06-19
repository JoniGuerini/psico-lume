import { useMemo } from "react"
import {
  ArrowDown,
  CalendarDays,
  Clock,
  History,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useClinicData } from "@/context/clinic-data-provider"
import { getEventsForPatientProfile } from "@/data/calendar"
import type { CalendarEvent, Patient, RescheduledFrom } from "@/data/types"
import {
  getEventStatus,
  sessionStatusConfig,
} from "@/lib/session-status"
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

function formatSessionDate(date: Date) {
  const raw = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
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

function SessionTimeRow({
  date,
  start,
  end,
}: {
  date: Date
  start: string
  end: string
}) {
  return (
    <>
      <span className="text-sm font-medium">{formatSessionDate(date)}</span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3 shrink-0" />
        {start} – {end}
      </span>
    </>
  )
}

function SessionHistoryCard({ event }: { event: CalendarEvent }) {
  const status = getEventStatus(event)
  const statusLabel = sessionStatusConfig[status].label

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
          />
        </div>
        <Badge
          variant="outline"
          className={cn("font-normal", sessionStatusConfig[status].badge)}
        >
          {statusLabel}
        </Badge>
      </div>
    </Card>
  )
}

function RescheduledSessionGroup({ event }: { event: CalendarEvent }) {
  const original = event.rescheduledFrom
  if (!original) {
    return <SessionHistoryCard event={event} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-sm">
      <div
        className={cn(
          "border-b border-border border-l-4 bg-card p-4",
          statusAccent.remarcada
        )}
      >
        <div className="mb-1">
          <span className="text-xs font-medium text-primary">Nova sessão</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <SessionTimeRow
              date={event.date}
              start={event.start}
              end={event.end}
            />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              sessionStatusConfig.remarcada.badge
            )}
          >
            Remarcada
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-b border-border bg-primary/5 px-4 py-2">
        <ArrowDown className="size-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">
          Reagendada a partir do horário original
        </span>
      </div>

      <OriginalSessionCard original={original} />
    </div>
  )
}

function OriginalSessionCard({ original }: { original: RescheduledFrom }) {
  return (
    <div className="border-l-4 border-l-muted-foreground/40 bg-muted/30 p-4">
      <div className="mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          Horário original
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1 opacity-80">
          <SessionTimeRow
            date={original.date}
            start={original.start}
            end={original.end}
          />
        </div>
        <Badge
          variant="outline"
          className="border-border bg-background/60 font-normal text-muted-foreground"
        >
          Substituído
        </Badge>
      </div>
    </div>
  )
}

function SessionHistoryItem({ event }: { event: CalendarEvent }) {
  if (event.rescheduledFrom && getEventStatus(event) === "remarcada") {
    return <RescheduledSessionGroup event={event} />
  }
  return <SessionHistoryCard event={event} />
}

export function PatientSessionsTab({ patient }: PatientSessionsTabProps) {
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
            <h3 className="font-heading text-lg font-semibold text-primary-foreground">
              Histórico de sessões
            </h3>
            <p className="text-sm text-sidebar-foreground/75">
              Sessões passadas e agendadas até 1 mês à frente de {patient.name}.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total no período" value={String(stats.total)} />
        <Stat label="Realizadas" value={String(stats.realizadas)} />
        <Stat label="Próximas" value={String(stats.proximas)} />
        <Stat label="Faltas / canceladas" value={String(stats.faltas)} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading text-base font-semibold">
            Sessões recentes e próximas
          </h4>
          <span className="text-sm text-muted-foreground">
            {sessions.length}{" "}
            {sessions.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {sessions.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed bg-background/40 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
              <CalendarDays className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Nenhuma sessão na agenda</p>
              <p className="text-sm text-muted-foreground">
                Agende uma sessão pelo botão no topo do perfil.
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((event) => (
              <SessionHistoryItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
