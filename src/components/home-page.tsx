import { ArrowRight, CalendarDays, UserPlus, Users } from "lucide-react"
import { useMemo } from "react"

import { modalityLabel } from "@/components/patients-page"
import { SessionStatusBadge } from "@/components/session-status-control"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useClinicData } from "@/context/clinic-data-provider"
import { eventsOfDay } from "@/data/calendar"
import { getWeekdayCode } from "@/data/patients"
import { getEventStatus } from "@/lib/session-status"
import { cn } from "@/lib/utils"

const SESSION_DURATION = 50

const businessDayLabels: Record<string, string> = {
  Seg: "Segunda",
  Ter: "Terça",
  Qua: "Quarta",
  Qui: "Quinta",
  Sex: "Sexta",
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

type HomePageProps = {
  onViewAgenda?: () => void
  onViewPatients?: () => void
  onViewAgendaWeek?: () => void
  onViewReceivables?: () => void
  onNewPatient?: () => void
  onOpenAgendaDay?: (date: Date) => void
}

export function HomePage({
  onViewAgenda,
  onViewPatients,
  onViewAgendaWeek,
  onViewReceivables,
  onNewPatient,
  onOpenAgendaDay,
}: HomePageProps) {
  const {
    patients,
    events,
    activeCount,
    scheduledCount,
    weekRevenue,
    overdueValue,
    overdueSessionCount,
  } = useClinicData()

  const today = new Date()
  const todayCode = getWeekdayCode(today)
  const todaysEvents = useMemo(() => eventsOfDay(events, today), [events, today])
  const patientById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients]
  )

  const greeting =
    today.getHours() < 12
      ? "Bom dia"
      : today.getHours() < 18
        ? "Boa tarde"
        : "Boa noite"

  const rawDate = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1)

  const stats: {
    label: string
    value: string
    hint: string
    tone?: "destructive"
    onClick?: () => void
  }[] = [
    {
      label: "Total de pacientes",
      value: String(patients.length),
      hint: `${activeCount} em acompanhamento`,
      onClick: onViewPatients,
    },
    {
      label: "Atendimentos da semana",
      value: String(scheduledCount),
      hint: "Sessões recorrentes",
      onClick: onViewAgendaWeek,
    },
    {
      label: "Receita da semana",
      value: brl.format(weekRevenue),
      hint: "Prevista",
    },
    {
      label: "Pagamentos em atraso",
      value: brl.format(overdueValue),
      hint: `${overdueSessionCount} ${overdueSessionCount === 1 ? "sessão" : "sessões"}`,
      tone: "destructive",
      onClick: onViewReceivables,
    },
  ]

  const showAgendaEmpty =
    patients.length === 0 || todaysEvents.length === 0

  return (
    <div className="flex min-h-0 flex-1 w-full flex-col gap-4 overflow-y-auto overscroll-contain">
      <Card className="flex flex-row flex-wrap items-center justify-between gap-4 border-transparent bg-sidebar p-6 text-sidebar-foreground">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-primary-foreground">
            {greeting}
          </h2>
          <p className="text-sm font-medium text-sidebar-primary">
            {formattedDate}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-heading text-3xl font-semibold tabular-nums text-sidebar-primary">
            {todaysEvents.length}
          </span>
          <span className="text-sm text-sidebar-foreground/80">
            {todaysEvents.length === 1
              ? "atendimento hoje"
              : "atendimentos hoje"}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "gap-2 bg-card p-5",
              stat.onClick &&
                "cursor-pointer transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            role={stat.onClick ? "button" : undefined}
            tabIndex={stat.onClick ? 0 : undefined}
            onClick={stat.onClick}
            onKeyDown={
              stat.onClick
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      stat.onClick?.()
                    }
                  }
                : undefined
            }
          >
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span
              className={`font-heading text-2xl font-semibold tracking-tight ${
                stat.tone === "destructive" ? "text-destructive" : ""
              }`}
            >
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.hint}</span>
          </Card>
        ))}
      </div>

      <div
        className={cn(
          "flex flex-col gap-4",
          showAgendaEmpty && "min-h-0 flex-1"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="font-semibold">Agenda de hoje</h3>
            <p className="text-sm text-muted-foreground">
              Seus atendimentos de {businessDayLabels[todayCode] ?? "hoje"}
            </p>
          </div>
          <Button size="sm" onClick={onViewAgenda}>
            Ver agenda
            <ArrowRight />
          </Button>
        </div>

        {patients.length === 0 ? (
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <div className="flex h-full w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/40 p-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
                  <Users className="size-5 text-muted-foreground" />
                </div>
                <div className="flex max-w-sm flex-col gap-1">
                  <p className="text-sm font-medium">Nenhum paciente cadastrado</p>
                  <p className="text-sm text-muted-foreground">
                    Cadastre seu primeiro paciente para começar a agendar
                    atendimentos.
                  </p>
                </div>
                <Button size="sm" onClick={onNewPatient}>
                  <UserPlus />
                  Novo paciente
                </Button>
              </div>
            </div>
          </Card>
        ) : todaysEvents.length === 0 ? (
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <div className="flex h-full w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/40 p-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
                  <CalendarDays className="size-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Dia livre</p>
                  <p className="text-sm text-muted-foreground">
                    Nenhum atendimento agendado para hoje.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {todaysEvents.map((event) => {
              const patient = event.patientId
                ? patientById.get(event.patientId)
                : undefined
              const status = getEventStatus(event)
              return (
                <div
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-stretch gap-4 rounded-2xl border bg-card px-4 py-3 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onOpenAgendaDay?.(event.date)}
                  onKeyDown={(keyboardEvent) => {
                    if (
                      keyboardEvent.key === "Enter" ||
                      keyboardEvent.key === " "
                    ) {
                      keyboardEvent.preventDefault()
                      onOpenAgendaDay?.(event.date)
                    }
                  }}
                >
                  <div className="flex w-14 shrink-0 flex-col items-center">
                    <span className="font-heading text-xl font-semibold leading-none tabular-nums">
                      {event.start}
                    </span>
                    <span className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {event.end}
                    </span>
                  </div>
                  <div className="w-px self-stretch bg-border" />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {event.title}
                      </span>
                      <SessionStatusBadge status={status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {patient ? (
                        <>
                          <span>{modalityLabel[patient.modality]}</span>
                          <span>
                            {patient.sessionDuration ?? SESSION_DURATION} min
                          </span>
                        </>
                      ) : (
                        <span>Sessão avulsa</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
