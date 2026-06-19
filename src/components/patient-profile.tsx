import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { NewPatientDialog } from "@/components/new-patient-dialog"
import { PatientRecordsTab } from "@/components/patient-records-tab"
import { ScheduleSessionDialog } from "@/components/schedule-session-dialog"
import {
  modalityLabel,
  statusConfig,
} from "@/components/patients-page"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { getRecordsForPatient } from "@/data/clinical-records"
import { getInitials, parsePrice } from "@/data/patients"
import type { Patient } from "@/data/types"
import { cn } from "@/lib/utils"

type PatientProfileProps = {
  patient: Patient
  onBack: () => void
  initialTab?: "overview" | "records"
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">
        {value ? value : <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("gap-4 p-6", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="font-heading text-base font-semibold">{title}</h3>
      </div>
      <Separator />
      {children}
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" className="gap-1 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
    </Card>
  )
}

export function PatientProfile({
  patient,
  onBack,
  initialTab = "overview",
}: PatientProfileProps) {
  const { sessionNotes, updatePatient, addEvent } = useClinicData()
  const [tab, setTab] = useState(initialTab)
  const [editOpen, setEditOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const noteCount = useMemo(
    () => getRecordsForPatient(sessionNotes, patient.id).length,
    [sessionNotes, patient.id]
  )
  const status = statusConfig[patient.status]
  const totalEstimated = patient.price
    ? parsePrice(patient.price) * patient.sessions
  : 0

  const address = [
    patient.street && patient.number
      ? `${patient.street}, ${patient.number}`
      : patient.street,
    patient.complement,
    patient.neighborhood,
    patient.city && patient.state
      ? `${patient.city} - ${patient.state}`
      : patient.city,
    patient.cep,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-card shadow-sm hover:bg-accent/50"
            onClick={() => setEditOpen(true)}
          >
            <Pencil />
            Editar
          </Button>
          <Button size="sm" onClick={() => setScheduleOpen(true)}>
            <CalendarPlus />
            Agendar sessão
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-3xl bg-sidebar p-6 text-sidebar-foreground sm:flex-row sm:items-center">
        <Avatar className="size-20 rounded-2xl ring-2 ring-white/15 after:rounded-2xl">
          <AvatarFallback className="rounded-2xl bg-white/10 text-2xl text-sidebar-foreground">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-2xl font-semibold text-[#FAF6EC]">
              {patient.name}
            </h2>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sidebar-foreground/70">
              {patient.email ? (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {patient.email}
                </span>
              ) : null}
              {patient.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {patient.phone}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="gap-1.5 border-white/15 bg-white/10 text-sidebar-foreground">
              <span className={cn("size-2 rounded-full", status.dot)} />
              {status.label}
            </Badge>
            {patient.approach && patient.approach !== "—" ? (
              <Badge className="border-white/15 bg-white/10 text-sidebar-foreground">
                {patient.approach}
              </Badge>
            ) : null}
            <Badge className="border-white/15 bg-white/10 text-sidebar-foreground">
              {modalityLabel[patient.modality]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sessões realizadas" value={String(patient.sessions)} />
        <Stat label="Paciente desde" value={patient.since || "—"} />
        <Stat
          label="Valor da sessão"
          value={patient.price ? `R$ ${patient.price}` : "—"}
        />
        <Stat label="Próxima sessão" value={patient.nextSession ?? "—"} />
      </div>

      <Card className="p-4">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "overview" | "records")}
        >
          <TabsList className="border border-border bg-background/40">
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="records">
              Prontuário{noteCount > 0 ? ` (${noteCount})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {tab === "overview" ? (
        <PatientOverview
          patient={patient}
          address={address}
          totalEstimated={totalEstimated}
        />
      ) : (
        <PatientRecordsTab patient={patient} />
      )}

      <NewPatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
        onUpdate={updatePatient}
      />

      <ScheduleSessionDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        patient={patient}
        onSchedule={addEvent}
      />
    </div>
  )
}

function PatientOverview({
  patient,
  address,
  totalEstimated,
}: {
  patient: Patient
  address: string
  totalEstimated: number
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Dados pessoais" icon={User}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Nome completo" value={patient.name} />
            <Field label="CPF" value={patient.cpf} />
            <Field label="Data de nascimento" value={patient.birthDate} />
            <Field label="Gênero" value={patient.gender} />
            <Field label="Tipo de paciente" value={patient.patientType} />
          </div>
        </Section>

        <Section title="Contato" icon={Phone}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="E-mail" value={patient.email} />
            <Field label="Telefone" value={patient.phone} />
            <Field label="Contato de emergência" value={patient.contactName} />
            <Field
              label="Telefone de emergência"
              value={patient.contactPhone}
            />
            <Field label="Parentesco" value={patient.contactRelation} />
          </div>
        </Section>

        <Section title="Endereço" icon={MapPin}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="CEP" value={patient.cep} />
            <Field label="Logradouro" value={patient.street} />
            <Field label="Número" value={patient.number} />
            <Field label="Complemento" value={patient.complement} />
            <Field label="Bairro" value={patient.neighborhood} />
            <Field label="Cidade" value={patient.city} />
            <Field label="Estado" value={patient.state} />
          </div>
          {address ? (
            <p className="text-sm text-muted-foreground">{address}</p>
          ) : null}
        </Section>

        <Section title="Acompanhamento" icon={ClipboardList}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Queixa principal" value={patient.complaint} />
            <Field label="Abordagem" value={patient.approach} />
            <Field
              label="Modalidade"
              value={modalityLabel[patient.modality]}
            />
            <Field label="Início da terapia" value={patient.therapyStart} />
            <Field label="Encaminhamento" value={patient.referral} />
            <Field
              label="Valor da sessão"
              value={patient.price ? `R$ ${patient.price}` : undefined}
            />
          </div>
        </Section>

        <Section title="Horários" icon={Clock} className="lg:col-span-2">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field label="Dia da sessão" value={patient.sessionDay} />
            <Field label="Horário" value={patient.sessionTime} />
            <Field label="Próxima sessão" value={patient.nextSession} />
          </div>

          {patient.schedules && patient.schedules.length > 0 ? (
            <div className="flex flex-col gap-2 pt-2">
              {patient.schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm"
                >
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="font-medium">{schedule.weekday || "—"}</span>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-4"
                  />
                  <span>{schedule.time || "—"}</span>
                  {schedule.duration ? (
                    <span className="text-muted-foreground">
                      · {schedule.duration} min
                    </span>
                  ) : null}
                  {schedule.modality ? (
                    <Badge
                      variant="outline"
                      className="ml-auto border-border bg-background/40"
                    >
                      {modalityLabel[schedule.modality]}
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        <Section
          title="Resumo financeiro"
          icon={CreditCard}
          className="lg:col-span-2"
        >
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field
              label="Valor por sessão"
              value={patient.price ? `R$ ${patient.price}` : undefined}
            />
            <Field
              label="Sessões realizadas"
              value={String(patient.sessions)}
            />
            <Field
              label="Total estimado"
              value={
                patient.price
                  ? totalEstimated.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : undefined
              }
            />
          </div>
        </Section>
      </div>
  )
}
