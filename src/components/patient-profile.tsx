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
import { patientStatusDotClass } from "@/lib/patient-status-ui"
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
import { useTranslation } from "@/context/locale-provider"
import { getRecordsForPatient } from "@/data/clinical-records"
import { getInitials } from "@/data/patients"
import type { CalendarEvent, Patient } from "@/data/types"
import {
  formatLocaleCurrency,
  formatLocaleDate,
  getModalityLabel,
  getPatientStatusLabel,
  getSessionFrequencyLabel,
} from "@/lib/i18n-helpers"
import { getPatientBillableSummary } from "@/lib/finance-metrics"
import {
  getSessionAmount,
  isPatientOverdue,
  isSessionPaymentOverdue,
} from "@/lib/session-payment"
import { cn } from "@/lib/utils"

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
  const { t } = useTranslation()
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
  const statusDot = patientStatusDotClass[patient.status]

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
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft />
            {t("patients.profile.back")}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card shadow-sm hover:bg-accent/50"
              onClick={() => setEditOpen(true)}
            >
              <Pencil />
              {t("patients.profile.edit")}
            </Button>
            <Button size="sm" onClick={() => setScheduleOpen(true)}>
              <CalendarPlus />
              {t("patients.profile.scheduleSession")}
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
              <h2 className="font-heading text-2xl font-semibold text-surface-navy-heading">
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
                <span className={cn("size-2 rounded-full", statusDot)} />
                {getPatientStatusLabel(t, patient.status)}
              </Badge>
              <Badge className="border-white/15 bg-white/10 text-sidebar-foreground">
                {getModalityLabel(t, patient.modality)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t("patients.profile.stats.completedSessions")}
            value={String(patient.sessions)}
          />
          <Stat
            label={t("patients.profile.stats.patientSince")}
            value={patient.since || "—"}
          />
          <Stat
            label={t("patients.profile.stats.sessionPrice")}
            value={patient.price ? `R$ ${patient.price}` : "—"}
          />
          <Stat
            label={t("patients.profile.stats.nextSession")}
            value={patient.nextSession ?? "—"}
          />
        </div>

        <Card className="shrink-0 p-4">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as PatientProfileTab)}
          >
            <TabsList className="h-auto min-h-9 border border-border bg-background/40">
              <TabsTrigger value="overview">
                {t("patients.profile.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="sessions">
                {t("patients.profile.tabs.sessions")}
                {sessionCount > 0 ? ` (${sessionCount})` : ""}
              </TabsTrigger>
              <TabsTrigger value="records">
                {t("patients.profile.tabs.records")}
                {noteCount > 0 ? ` (${noteCount})` : ""}
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
      </div>

      {editOpen ? (
        <NewPatientDialog
          open
          onOpenChange={setEditOpen}
          patient={patient}
          onUpdate={updatePatient}
        />
      ) : null}

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
            <DialogTitle className="text-lg">
              {t("patients.profile.delete.title")}
            </DialogTitle>
            <DialogDescription>
              {t("patients.profile.delete.description", { name: patient.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
            >
              {t("common.cancel")}
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
              {t("patients.profile.delete.confirm")}
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
  const { t, locale } = useTranslation()
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
        <Section title={t("patients.profile.sections.personal")} icon={User}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label={t("patients.profile.fields.fullName")} value={patient.name} />
            <Field label={t("patients.profile.fields.cpf")} value={patient.cpf} />
            <Field label={t("patients.profile.fields.birthDate")} value={patient.birthDate} />
            <Field label={t("patients.profile.fields.gender")} value={patient.gender} />
            <Field label={t("patients.profile.fields.patientType")} value={patient.patientType} />
          </div>
        </Section>

        <Section title={t("patients.profile.sections.contact")} icon={Phone}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label={t("patients.profile.fields.email")} value={patient.email} />
            <Field label={t("patients.profile.fields.phone")} value={patient.phone} />
            <Field label={t("patients.profile.fields.emergencyContact")} value={patient.contactName} />
            <Field
              label={t("patients.profile.fields.emergencyPhone")}
              value={patient.contactPhone}
            />
            <Field label={t("patients.profile.fields.relation")} value={patient.contactRelation} />
          </div>
        </Section>

        <Section title={t("patients.profile.sections.address")} icon={MapPin}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label={t("patients.profile.fields.cep")} value={patient.cep} />
            <Field label={t("patients.profile.fields.street")} value={patient.street} />
            <Field label={t("patients.profile.fields.number")} value={patient.number} />
            <Field label={t("patients.profile.fields.complement")} value={patient.complement} />
            <Field label={t("patients.profile.fields.neighborhood")} value={patient.neighborhood} />
            <Field label={t("patients.profile.fields.city")} value={patient.city} />
            <Field label={t("patients.profile.fields.state")} value={patient.state} />
          </div>
          {address ? (
            <p className="text-sm text-muted-foreground">{address}</p>
          ) : null}
        </Section>

        <Section title={t("patients.profile.sections.care")} icon={ClipboardList}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label={t("patients.profile.fields.complaint")} value={patient.complaint} />
            <Field
              label={t("patients.profile.fields.modality")}
              value={getModalityLabel(t, patient.modality)}
            />
            <Field label={t("patients.profile.fields.therapyStart")} value={patient.therapyStart} />
            <Field label={t("patients.profile.fields.referral")} value={patient.referral} />
            <Field
              label={t("patients.profile.fields.sessionPrice")}
              value={patient.price ? `R$ ${patient.price}` : undefined}
            />
          </div>
          {patient.notes ? (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("patients.profile.fields.notes")}
              </span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {patient.notes}
              </p>
            </div>
          ) : null}
        </Section>

        <Section title={t("patients.profile.sections.schedule")} icon={Clock} className="lg:col-span-2">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field
              label={t("patients.profile.fields.frequency")}
              value={getSessionFrequencyLabel(t, patient.sessionFrequency)}
            />
            <Field label={t("patients.profile.fields.sessionDay")} value={patient.sessionDay} />
            <Field label={t("patients.profile.fields.sessionTime")} value={patient.sessionTime} />
            <Field label={t("patients.profile.fields.nextSession")} value={patient.nextSession} />
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
                      {getModalityLabel(t, schedule.modality)}
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        <Section
          title={t("patients.profile.sections.financial")}
          icon={CreditCard}
          className="lg:col-span-2"
        >
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field
              label={t("patients.profile.fields.pricePerSession")}
              value={patient.price ? `R$ ${patient.price}` : undefined}
            />
            <Field
              label={t("patients.profile.fields.received")}
              value={formatLocaleCurrency(billing.paidTotal, locale)}
            />
            <Field
              label={t("patients.profile.fields.receivable")}
              value={formatLocaleCurrency(billing.unpaidTotal, locale)}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("patients.profile.fields.overdueStatus")}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "border-border bg-background/40",
                  overdue && "border-attention/40 text-attention"
                )}
              >
                {overdue
                  ? t("patients.profile.payment.overdue")
                  : t("patients.profile.payment.onTrack")}
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
                <SelectTrigger className="h-8 w-full max-w-xs border-0 bg-muted text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    {t("patients.profile.payment.auto")}
                  </SelectItem>
                  <SelectItem value="overdue">
                    {t("patients.profile.payment.markOverdue")}
                  </SelectItem>
                  <SelectItem value="clear">
                    {t("patients.profile.payment.markClear")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {billing.unpaidSessions.length > 0 ? (
            <div className="flex flex-col gap-2 pt-4">
              <span className="text-xs font-medium text-muted-foreground">
                {t("patients.profile.fields.pendingSessions")}
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
                          {formatLocaleDate(session.date, locale)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatLocaleCurrency(amount, locale)}
                          {sessionOverdue
                            ? t("patients.profile.payment.overdueHint")
                            : ""}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkPaid(session.id, true)}
                      >
                        <CheckCircle2 className="size-3.5" />
                        {t("patients.profile.payment.markPaid")}
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
              {t("patients.profile.sections.danger")}
            </h3>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            {t("patients.profile.delete.dangerDescription", { name: patient.name })}
          </p>
          <div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteRequest}
            >
              <Trash2 />
              {t("patients.profile.delete.confirm")}
            </Button>
          </div>
        </Card>
      </div>
  )
}
