import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { NewPatientDialog } from "@/components/new-patient-dialog"
import { PatientRecordsTab } from "@/components/patient-records-tab"
import { PatientSessionsTab } from "@/components/patient-sessions-tab"
import { ScheduleSessionDialog } from "@/components/schedule-session-dialog"
import {
  modalityLabel,
  statusConfig,
} from "@/components/patients-page"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { getRecordsForPatient } from "@/data/clinical-records"
import { getInitials } from "@/data/patients"
import type { CalendarEvent, Patient } from "@/data/types"
import { getPatientBillableSummary } from "@/lib/finance-metrics"
import {
  getSessionAmount,
  isPatientOverdue,
  isSessionPaymentOverdue,
} from "@/lib/session-payment"
import { sessionFrequencyLabel } from "@/lib/session-frequency"
import { cn } from "@/lib/utils"

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

type PatientProfileTab = "overview" | "sessions" | "records"

type PatientProfileProps = {
  patient: Patient
  onBack: () => void
  onPatientDeleted?: () => void
  initialTab?: PatientProfileTab
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
  onPatientDeleted,
  initialTab = "overview",
}: PatientProfileProps) {
  const {
    sessionNotes,
    updatePatient,
    deletePatient,
    addEvent,
    events,
    patients,
    markEventPaid,
    setPatientPaymentOverdueManual,
  } = useClinicData()
  const [tab, setTab] = useState(initialTab)
  const [editOpen, setEditOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const noteCount = useMemo(
    () => getRecordsForPatient(sessionNotes, patient.id).length,
    [sessionNotes, patient.id]
  )
  const sessionCount = useMemo(
    () => events.filter((event) => event.patientId === patient.id).length,
    [events, patient.id]
  )
  const status = statusConfig[patient.status]

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
            <h2 className="font-heading text-2xl font-semibold text-primary-foreground">
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
          onValueChange={(value) => setTab(value as PatientProfileTab)}
        >
          <TabsList className="border border-border bg-background/40">
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="sessions">
              Histórico de sessões
              {sessionCount > 0 ? ` (${sessionCount})` : ""}
            </TabsTrigger>
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
          events={events}
          onMarkPaid={markEventPaid}
          onSetPaymentOverdueManual={setPatientPaymentOverdueManual}
          onDeleteRequest={() => setDeleteOpen(true)}
        />
      ) : tab === "sessions" ? (
        <PatientSessionsTab patient={patient} />
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
        patients={patients}
        onSchedule={addEvent}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">Excluir paciente?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{patient.name}</span>{" "}
              e todo o prontuário, agenda e histórico financeiro associados
              serão removidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deletePatient(patient.id)
                setDeleteOpen(false)
                onPatientDeleted?.()
                onBack()
              }}
            >
              <Trash2 />
              Excluir paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PatientOverview({
  patient,
  address,
  events,
  onMarkPaid,
  onSetPaymentOverdueManual,
  onDeleteRequest,
}: {
  patient: Patient
  address: string
  events: CalendarEvent[]
  onMarkPaid: (id: string, paid?: boolean) => void
  onSetPaymentOverdueManual: (patientId: string, manual: boolean | null) => void
  onDeleteRequest: () => void
}) {
  const billing = useMemo(
    () => getPatientBillableSummary(patient.id, events, patient),
    [patient, events]
  )
  const overdue = useMemo(
    () => isPatientOverdue(patient, events),
    [patient, events]
  )
  const manualValue =
    patient.paymentOverdueManual === true
      ? "overdue"
      : patient.paymentOverdueManual === false
        ? "clear"
        : "auto"

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
          {patient.notes ? (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-xs font-medium text-muted-foreground">
                Observações
              </span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {patient.notes}
              </p>
            </div>
          ) : null}
        </Section>

        <Section title="Horários" icon={Clock} className="lg:col-span-2">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field
              label="Frequência"
              value={sessionFrequencyLabel(patient.sessionFrequency)}
            />
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
              label="Recebido"
              value={brl.format(billing.paidTotal)}
            />
            <Field
              label="A receber"
              value={brl.format(billing.unpaidTotal)}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-medium text-muted-foreground">
              Status de inadimplência
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "border-border bg-background/40",
                  overdue && "border-destructive/40 text-destructive"
                )}
              >
                {overdue ? "Inadimplente" : "Em dia"}
              </Badge>
              <Select
                value={manualValue}
                onValueChange={(value) => {
                  const manual =
                    value === "overdue"
                      ? true
                      : value === "clear"
                        ? false
                        : null
                  onSetPaymentOverdueManual(patient.id, manual)
                }}
              >
                <SelectTrigger className="h-8 w-full max-w-xs border-border bg-background/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automático (por sessões)</SelectItem>
                  <SelectItem value="overdue">Marcar inadimplente</SelectItem>
                  <SelectItem value="clear">Marcar em dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {billing.unpaidSessions.length > 0 ? (
            <div className="flex flex-col gap-2 pt-4">
              <span className="text-xs font-medium text-muted-foreground">
                Sessões pendentes
              </span>
              <div className="flex flex-col gap-2">
                {billing.unpaidSessions.map((session) => {
                  const amount = getSessionAmount(session, patient)
                  const sessionOverdue = isSessionPaymentOverdue(session)
                  return (
                    <div
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background/40 px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {session.date.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {brl.format(amount)}
                          {sessionOverdue ? " · em atraso" : ""}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkPaid(session.id, true)}
                      >
                        <CheckCircle2 className="size-3.5" />
                        Marcar paga
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </Section>

        <Card className="gap-4 border-destructive/30 p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            <h3 className="font-heading text-base font-semibold text-destructive">
              Zona de perigo
            </h3>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Excluir {patient.name} remove permanentemente o cadastro, prontuário,
            sessões agendadas e registros financeiros deste paciente.
          </p>
          <div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteRequest}
            >
              <Trash2 />
              Excluir paciente
            </Button>
          </div>
        </Card>
      </div>
  )
}
