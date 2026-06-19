import { useMemo, useState } from "react"
import {
  CalendarPlus,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  UserPlus,
} from "lucide-react"

import { NewPatientDialog } from "@/components/new-patient-dialog"
import { PatientProfile } from "@/components/patient-profile"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { getInitials } from "@/data/patients"
import type { Patient, PatientModality, PatientStatus } from "@/data/types"
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

export function PatientsPage() {
  const { patients, activeCount, addPatient } = useClinicData()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<PatientStatus | "todos">("todos")
  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [profileTab, setProfileTab] = useState<
    "overview" | "sessions" | "records"
  >("overview")

  function openProfile(
    patientId: string,
    tab: "overview" | "sessions" | "records" = "overview"
  ) {
    setProfileTab(tab)
    setSelectedId(patientId)
  }

  const selectedPatient =
    patients.find((patient) => patient.id === selectedId) ?? null

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
      <PatientProfile
        patient={selectedPatient}
        initialTab={profileTab}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Pacientes</h2>
              <Badge variant="outline" className="border-border bg-background/40">
                {activeCount} ativos
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie seus pacientes, acompanhamentos e próximas sessões.
            </p>
          </div>
          <Button size="sm" onClick={() => setNewPatientOpen(true)}>
            <UserPlus />
            Novo paciente
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, e-mail, CPF ou queixa..."
              className="border-border bg-background/40 pl-9 hover:bg-accent/50"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as PatientStatus | "todos")
            }
          >
            <SelectTrigger className="border-border bg-background/40 hover:bg-accent/50 sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="em-pausa">Em pausa</SelectItem>
              <SelectItem value="lista-espera">Lista de espera</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm whitespace-nowrap text-muted-foreground sm:ml-1">
            {filtered.length} pacientes
          </span>
        </div>
      </Card>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-3">
        <div className="overflow-hidden rounded-2xl bg-sidebar shadow-sm">
          <Table className="table-fixed">
            <PatientCols />
            <TableHeader className="[&_th]:text-sidebar-foreground/75">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="pl-4">Paciente</TableHead>
                <TableHead>Queixa</TableHead>
                <TableHead>Abordagem</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima sessão</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Sessões</TableHead>
                <TableHead className="pr-4" />
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        <Card className="min-h-0 w-full flex-1 overflow-hidden p-0 [&>[data-slot=table-container]]:h-full [&>[data-slot=table-container]]:overflow-auto">
          <Table className="table-fixed">
            <PatientCols />
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="h-40 text-center">
                    <p className="text-sm font-medium">
                      Nenhum paciente encontrado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ajuste a busca ou o filtro de status.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((patient) => (
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
                      {modalityLabel[patient.modality]}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            statusConfig[patient.status].dot
                          )}
                        />
                        {statusConfig[patient.status].label}
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
                            aria-label={`Ações de ${patient.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openProfile(patient.id, "records")}
                          >
                            <Eye />
                            Ver prontuário
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CalendarPlus />
                            Agendar sessão
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText />
                            Anotações
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <NewPatientDialog
        open={newPatientOpen}
        onOpenChange={setNewPatientOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}
