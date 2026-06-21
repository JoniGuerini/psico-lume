import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Check,
  CheckCheck,
  CircleDollarSign,
  Clock,
  User,
} from "lucide-react"

import { NoPatientsEmptyPage } from "@/components/no-patients-empty-page"
import { modalityLabel } from "@/components/patients-page"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { getInitials } from "@/data/patients"
import { cn } from "@/lib/utils"

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

type Filter = "todas" | "atraso"

type UnpaidSessionsPageProps = {
  onOpenPatient?: (patientId: string) => void
  onNewPatient?: () => void
  initialFilter?: Filter
}

function formatSessionDate(date: Date) {
  const raw = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
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
  tone?: "destructive"
}) {
  return (
    <Card size="sm" className="gap-1 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-heading text-2xl font-semibold tracking-tight tabular-nums",
          tone === "destructive" && "text-destructive"
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
  const {
    patients,
    unpaidSessions,
    unpaidSessionsTotal,
    markEventPaid,
    markAllEventsPaid,
  } = useClinicData()
  const [filter, setFilter] = useState<Filter>(initialFilter)

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

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
        description="Cadastre pacientes e registre sessões realizadas para acompanhar os pagamentos aqui."
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-4 border-transparent bg-sidebar p-5 text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <CircleDollarSign className="size-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold text-primary-foreground">
              Sessões a receber
            </h2>
            <p className="text-sm text-sidebar-foreground/75">
              Sessões realizadas ainda não pagas — marque como recebidas quando
              o pagamento for confirmado.
            </p>
          </div>
        </div>
        {filtered.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-white/20 bg-white/10 text-sidebar-foreground hover:bg-white/15 hover:text-primary-foreground"
            onClick={() => markAllEventsPaid(visibleIds)}
          >
            <CheckCheck />
            Marcar visíveis como pagas
          </Button>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Sessões em aberto"
          value={String(unpaidSessions.length)}
          hint="Realizadas sem pagamento"
        />
        <Stat
          label="Total a receber"
          value={brl.format(unpaidSessionsTotal)}
          hint="Valor consolidado"
        />
        <Stat
          label="Em atraso"
          value={String(overdueCount)}
          hint="Após o mês da sessão"
          tone={overdueCount > 0 ? "destructive" : undefined}
        />
        <Stat
          label="Valor em atraso"
          value={brl.format(overdueTotal)}
          hint={
            overdueCount > 0 ? "Priorize a cobrança" : "Nenhuma pendência antiga"
          }
          tone={overdueTotal > 0 ? "destructive" : undefined}
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
                Todas
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
                Em atraso
                {overdueCount > 0 ? (
                  <Badge
                    variant="outline"
                    className="ml-1.5 border-destructive/30 bg-destructive/10 px-1.5 py-0 text-[10px] text-destructive"
                  >
                    {overdueCount}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-sm text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1 ? "sessão listada" : "sessões listadas"}
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed bg-background/40 px-6 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
            <Check className="size-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              {filter === "atraso"
                ? "Nenhuma sessão em atraso"
                : "Tudo recebido por aqui"}
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === "atraso"
                ? "Não há pendências com mais de uma semana."
                : "Quando uma sessão for realizada e ainda não paga, ela aparece nesta lista."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((row) => (
            <Card
              key={row.event.id}
              className={cn(
                "flex flex-col gap-3 p-4 shadow-sm sm:flex-row sm:items-center",
                row.overdue ? "border-destructive/25" : "border-border"
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
                          className="border-destructive/30 bg-destructive/10 font-normal text-destructive"
                        >
                          <AlertCircle className="size-3" />
                          Em atraso
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border bg-background/40 font-normal"
                        >
                          Pendente
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{formatSessionDate(row.event.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 shrink-0" />
                        {row.event.start} – {row.event.end}
                      </span>
                      <span>{modalityLabel[row.patient.modality]}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {row.daysSince === 0
                        ? "Realizada hoje"
                        : row.daysSince === 1
                          ? "Há 1 dia"
                          : `Há ${row.daysSince} dias`}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end lg:flex-row lg:items-center">
                  <span className="font-heading text-lg font-semibold tabular-nums">
                    {brl.format(row.amount)}
                  </span>
                  <div className="flex gap-2">
                    {onOpenPatient ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-background/40 hover:bg-accent/50"
                        onClick={() => onOpenPatient(row.patient.id)}
                      >
                        <User />
                        Perfil
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      onClick={() => markEventPaid(row.event.id)}
                    >
                      <Check />
                      Marcar paga
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
