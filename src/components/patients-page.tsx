import { useEffect, useMemo, useState } from "react"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { getRecordsForPatient } from "@/data/clinical-records"
import { getInitials } from "@/data/patients"
import type { Patient, PatientModality, PatientStatus } from "@/data/types"
import {
  getModalityLabel,
  getPatientStatusLabel,
} from "@/lib/i18n-helpers"
import { cn } from "@/lib/utils"

export type {
  Patient,
  PatientModality,
  PatientSchedule,
  PatientStatus,
} from "@/data/types"

export const statusConfig: Record<
  PatientStatus,
  { label: string; dot: string }
> = {
  ativo: { label: "Ativo", dot: "bg-emerald-500" },
  "em-pausa": { label: "Em pausa", dot: "bg-amber-500" },
  "lista-espera": { label: "Lista de espera", dot: "bg-sky-500" },
  alta: { label: "Alta", dot: "bg-muted-foreground" },
}

export const modalityLabel: Record<PatientModality, string> = {
  presencial: "Presencial",
  online: "Remoto",
  hibrido: "Híbrido",
}

const columnWidths = ["22%", "12%", "11%", "10%", "12%", "12%", "9%", "7%", "5%"]

function PatientCols() {
  return (
    <colgroup>
      {columnWidths.map((width, index) => (
        <col key={index} style={{ width }} />
      ))}
    </colgroup>
  )
}

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
  const { patients, activeCount, addPatient, addEvent, addSessionNote, sessionNotes } =
    useClinicData()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<PatientStatus | "todos">("todos")
  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(initialPatientId)
  const [schedulePatientId, setSchedulePatientId] = useState<string | null>(null)
  const [notePatientId, setNotePatientId] = useState<string | null>(null)
  const [profileTab, setProfileTab] = useState<
    "overview" | "sessions" | "records"
  >(initialProfileTab)

  useEffect(() => {
    if (initialPatientId) {
      setSelectedId(initialPatientId)
      setProfileTab(initialProfileTab)
    }
  }, [initialPatientId, initialProfileTab])

  useEffect(() => {
    if (openNewPatient) {
      setNewPatientOpen(true)
      onNewPatientOpenChange?.(false)
    }
  }, [openNewPatient, onNewPatientOpenChange])

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

  const notePatientNextSession = useMemo(() => {
    if (!notePatient) return 1
    const notes = getRecordsForPatient(sessionNotes, notePatient.id)
    const maxNumber = notes.reduce(
      (max, note) => Math.max(max, note.sessionNumber),
      0
    )
    return Math.max(maxNumber + 1, notePatient.sessions + 1)
  }, [notePatient, sessionNotes])

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
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
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
      <div className="flex min-h-0 flex-1 w-full flex-col">
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

        <NewPatientDialog
          open={newPatientOpen}
          onOpenChange={handleNewPatientOpenChange}
          onCreate={handleCreate}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 w-full flex-col gap-4">
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

      <div className="flex min-h-0 w-full flex-1 flex-col gap-3">
        <div className="overflow-hidden rounded-2xl bg-sidebar shadow-sm">
          <Table className="table-fixed">
            <PatientCols />
            <TableHeader className="[&_th]:text-sidebar-foreground/75">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="pl-4">{t("patients.columns.patient")}</TableHead>
                <TableHead>{t("patients.columns.complaint")}</TableHead>
                <TableHead>{t("patients.columns.approach")}</TableHead>
                <TableHead>{t("patients.columns.modality")}</TableHead>
                <TableHead>{t("patients.columns.status")}</TableHead>
                <TableHead>{t("patients.columns.nextSession")}</TableHead>
                <TableHead className="text-right">{t("patients.columns.price")}</TableHead>
                <TableHead className="text-right">{t("patients.columns.sessions")}</TableHead>
                <TableHead className="pr-4" />
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
          {filtered.length === 0 ? (
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
          ) : (
            <ScrollArea className="h-full min-h-0 flex-1">
              <Table className="table-fixed">
                <PatientCols />
                <TableBody>
                  {filtered.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => openProfile(patient.id)}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-lg after:rounded-lg">
                          <AvatarFallback className="rounded-lg bg-background/40 text-xs text-foreground">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">
                            {patient.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {patient.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {patient.complaint}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.approach}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getModalityLabel(t, patient.modality)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            statusConfig[patient.status].dot
                          )}
                        />
                        {getPatientStatusLabel(t, patient.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {patient.nextSession ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {patient.price ? (
                        `R$ ${patient.price}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {patient.sessions}
                    </TableCell>
                    <TableCell
                      className="pr-4"
                      onClick={(event) => event.stopPropagation()}
                    >
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
                          <DropdownMenuItem
                            onClick={() => openProfile(patient.id, "records")}
                          >
                            <Eye />
                            {t("patients.actions.viewRecord")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSchedulePatientId(patient.id)}
                          >
                            <CalendarPlus />
                            {t("patients.actions.schedule")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setNotePatientId(patient.id)}
                          >
                            <FileText />
                            {t("patients.actions.newNote")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </Card>
      </div>

      <NewPatientDialog
        open={newPatientOpen}
        onOpenChange={handleNewPatientOpenChange}
        onCreate={handleCreate}
      />

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
          open={notePatientId !== null}
          onOpenChange={(open) => {
            if (!open) setNotePatientId(null)
          }}
          patient={notePatient}
          nextSessionNumber={notePatientNextSession}
          onCreate={addSessionNote}
        />
      ) : null}
    </div>
  )
}
