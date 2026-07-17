import { useMemo, useState, type ReactNode } from "react"
import {
  CalendarPlus,
  Eye,
  FileText,
  MoreHorizontal,
  SearchX,
  UserPlus,
  Users,
} from "lucide-react"

import { NewPatientDialog } from "@/components/new-patient-dialog"
import { NewSessionNoteDialog } from "@/components/new-session-note-dialog"
import { PatientProfile } from "@/components/patient-profile"
import { ScheduleSessionDialog } from "@/components/schedule-session-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchInput } from "@/components/ui/search-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { getInitials } from "@/data/patients"
import type { Patient, PatientStatus } from "@/data/types"
import {
  getModalityLabel,
  getPatientStatusLabel,
} from "@/lib/i18n-helpers"
import { patientStatusDotClass } from "@/lib/patient-status-ui"
import { cn } from "@/lib/utils"

function PatientsListEmptyState({
  hasPatients,
  onNewPatient,
  onClearFilters,
}: {
  hasPatients: boolean
  onNewPatient: () => void
  onClearFilters: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/40 p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
        {hasPatients ? (
          <SearchX className="size-5 text-muted-foreground" />
        ) : (
          <Users className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-medium">
          {hasPatients
            ? t("patients.notFound")
            : t("empty.noPatients.title")}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasPatients
            ? t("patients.notFoundHint")
            : t("empty.noPatients.description")}
        </p>
      </div>
      {hasPatients ? (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          {t("patients.clearFilters")}
        </Button>
      ) : (
        <Button size="sm" onClick={onNewPatient}>
          <UserPlus />
          {t("common.newPatient")}
        </Button>
      )}
    </div>
  )
}

function PatientMeta({
  label,
  value,
  muted,
}: {
  label: string
  value: ReactNode
  muted?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "truncate text-sm",
          muted && "text-muted-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PatientListCard({
  patient,
  onOpen,
  onViewRecord,
  onSchedule,
  onNewNote,
}: {
  patient: Patient
  onOpen: () => void
  onViewRecord: () => void
  onSchedule: () => void
  onNewNote: () => void
}) {
  const { t } = useTranslation()

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      className="cursor-pointer gap-4 p-4 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0 rounded-lg after:rounded-lg">
          <AvatarFallback className="rounded-lg bg-background/40 text-xs text-foreground">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-heading text-sm font-semibold">
                {patient.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {patient.email}
              </span>
            </div>

            <div
              className="flex shrink-0 items-center gap-2"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <span className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    patientStatusDotClass[patient.status]
                  )}
                />
                {getPatientStatusLabel(t, patient.status)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={t("patients.actions.menuAria", {
                      name: patient.name,
                    })}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    {t("patients.actions.menu")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onViewRecord}>
                    <Eye />
                    {t("patients.actions.viewRecord")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSchedule}>
                    <CalendarPlus />
                    {t("patients.actions.schedule")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNewNote}>
                    <FileText />
                    {t("patients.actions.newNote")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <PatientMeta
              label={t("patients.columns.complaint")}
              value={patient.complaint}
            />
            <PatientMeta
              label={t("patients.columns.modality")}
              value={getModalityLabel(t, patient.modality)}
              muted
            />
            <PatientMeta
              label={t("patients.columns.nextSession")}
              value={
                patient.nextSession ?? (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
            <PatientMeta
              label={t("patients.columns.price")}
              value={
                patient.price ? (
                  <span className="tabular-nums">R$ {patient.price}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
            <PatientMeta
              label={t("patients.columns.sessions")}
              value={
                <span className="tabular-nums">{patient.sessions}</span>
              }
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function PatientsPage({
  initialPatientId = null,
  initialProfileTab = "overview",
  openNewPatient = false,
  onNewPatientOpenChange,
}: {
  initialPatientId?: string | null
  initialProfileTab?: "overview" | "sessions" | "records"
  openNewPatient?: boolean
  onNewPatientOpenChange?: (open: boolean) => void
} = {}) {
  const { t } = useTranslation()
  const {
    patients,
    activeCount,
    addPatient,
    addEvent,
    addSessionNote,
    sessionNotes,
    events,
  } = useClinicData()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<PatientStatus | "todos">("todos")
  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(initialPatientId)
  const [schedulePatientId, setSchedulePatientId] = useState<string | null>(
    null
  )
  const [notePatientId, setNotePatientId] = useState<string | null>(null)
  const [profileTab, setProfileTab] = useState<
    "overview" | "sessions" | "records"
  >(initialProfileTab)
  const newPatientDialogOpen = newPatientOpen || openNewPatient

  function handleNewPatientOpenChange(open: boolean) {
    setNewPatientOpen(open)
    if (!open) onNewPatientOpenChange?.(false)
  }

  function openProfile(
    patientId: string,
    tab: "overview" | "sessions" | "records" = "overview"
  ) {
    setProfileTab(tab)
    setSelectedId(patientId)
  }

  const selectedPatient =
    patients.find((patient) => patient.id === selectedId) ?? null

  const schedulePatient =
    patients.find((patient) => patient.id === schedulePatientId) ?? null

  const notePatient =
    patients.find((patient) => patient.id === notePatientId) ?? null

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return patients.filter((patient) => {
      const matchesStatus = status === "todos" || patient.status === status
      const matchesQuery =
        normalized === "" ||
        patient.name.toLowerCase().includes(normalized) ||
        patient.email.toLowerCase().includes(normalized) ||
        patient.cpf.toLowerCase().includes(normalized) ||
        patient.complaint.toLowerCase().includes(normalized)
      return matchesStatus && matchesQuery
    })
  }, [patients, query, status])

  function handleCreate(patient: Patient) {
    addPatient(patient)
  }

  if (selectedPatient) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <PatientProfile
          patient={selectedPatient}
          initialTab={profileTab}
          onBack={() => setSelectedId(null)}
          onPatientDeleted={() => setSelectedId(null)}
        />
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
          <div className="flex min-h-0 flex-1 flex-col p-4">
            <PatientsListEmptyState
              hasPatients={false}
              onNewPatient={() => setNewPatientOpen(true)}
              onClearFilters={() => {
                setQuery("")
                setStatus("todos")
              }}
            />
          </div>
        </Card>

        {newPatientDialogOpen ? (
          <NewPatientDialog
            open
            onOpenChange={handleNewPatientOpenChange}
            onCreate={handleCreate}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{t("patients.title")}</h2>
              <Badge variant="outline" className="border-border bg-background/40">
                {t("patients.activeBadge", { count: activeCount })}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("patients.subtitle")}
            </p>
          </div>
          <Button size="sm" onClick={() => setNewPatientOpen(true)}>
            <UserPlus />
            {t("common.newPatient")}
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            containerClassName="flex-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("patients.searchPlaceholder")}
            className="border-border bg-background/40 hover:bg-accent/50"
          />
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as PatientStatus | "todos")
            }
          >
            <SelectTrigger className="border-border bg-background/40 hover:bg-accent/50 sm:w-48">
              <SelectValue placeholder={t("patients.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">{t("patients.allStatuses")}</SelectItem>
              <SelectItem value="ativo">
                {getPatientStatusLabel(t, "ativo")}
              </SelectItem>
              <SelectItem value="em-pausa">
                {getPatientStatusLabel(t, "em-pausa")}
              </SelectItem>
              <SelectItem value="lista-espera">
                {getPatientStatusLabel(t, "lista-espera")}
              </SelectItem>
              <SelectItem value="alta">
                {getPatientStatusLabel(t, "alta")}
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm whitespace-nowrap text-muted-foreground sm:ml-1">
            {t("patients.count", { count: filtered.length })}
          </span>
        </div>
      </Card>

      <div className="flex min-h-0 w-full flex-1 flex-col">
        {filtered.length === 0 ? (
          <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <PatientsListEmptyState
                hasPatients
                onNewPatient={() => setNewPatientOpen(true)}
                onClearFilters={() => {
                  setQuery("")
                  setStatus("todos")
                }}
              />
            </div>
          </Card>
        ) : (
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="flex flex-col gap-3 pr-1 pb-1">
              {filtered.map((patient) => (
                <PatientListCard
                  key={patient.id}
                  patient={patient}
                  onOpen={() => openProfile(patient.id)}
                  onViewRecord={() => openProfile(patient.id, "records")}
                  onSchedule={() => setSchedulePatientId(patient.id)}
                  onNewNote={() => setNotePatientId(patient.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {newPatientDialogOpen ? (
        <NewPatientDialog
          open
          onOpenChange={handleNewPatientOpenChange}
          onCreate={handleCreate}
        />
      ) : null}

      {schedulePatient ? (
        <ScheduleSessionDialog
          open={schedulePatientId !== null}
          onOpenChange={(open) => {
            if (!open) setSchedulePatientId(null)
          }}
          patient={schedulePatient}
          patients={patients}
          onSchedule={addEvent}
        />
      ) : null}

      {notePatient ? (
        <NewSessionNoteDialog
          key={`new-note-${notePatient.id}`}
          open={notePatientId !== null}
          onOpenChange={(open) => {
            if (!open) setNotePatientId(null)
          }}
          patient={notePatient}
          events={events}
          sessionNotes={sessionNotes}
          onCreate={addSessionNote}
        />
      ) : null}
    </div>
  )
}
