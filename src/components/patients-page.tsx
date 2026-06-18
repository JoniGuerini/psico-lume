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
import { cn } from "@/lib/utils"

export type PatientStatus = "ativo" | "em-pausa" | "lista-espera" | "alta"

export type PatientModality = "presencial" | "online" | "hibrido"

export type PatientSchedule = {
  weekday: string
  time: string
  duration: string
  modality: PatientModality | ""
}

export type Patient = {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  complaint: string
  approach: string
  modality: PatientModality
  price: string
  status: PatientStatus
  sessionDay: string
  sessionTime: string
  nextSession: string | null
  sessions: number
  since: string
  birthDate?: string
  gender?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  contactName?: string
  contactPhone?: string
  contactRelation?: string
  patientType?: string
  therapyStart?: string
  referral?: string
  schedules?: PatientSchedule[]
}

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

export const initialPatients: Patient[] = [
  {
    id: "1",
    name: "Mariana Lopes",
    cpf: "312.456.789-00",
    email: "mariana.lopes@example.com",
    phone: "(11) 99812-4471",
    complaint: "Ansiedade",
    approach: "TCC",
    modality: "online",
    price: "180,00",
    status: "ativo",
    sessionDay: "Qua",
    sessionTime: "09:00",
    nextSession: "Qua · 09:00",
    sessions: 14,
    since: "Mar 2025",
  },
  {
    id: "2",
    name: "Rafael Souza",
    cpf: "987.654.321-12",
    email: "rafael.souza@example.com",
    phone: "(11) 99654-3320",
    complaint: "Burnout",
    approach: "TCC",
    modality: "presencial",
    price: "200,00",
    status: "ativo",
    sessionDay: "Qua",
    sessionTime: "11:00",
    nextSession: "Qua · 11:00",
    sessions: 8,
    since: "Jan 2026",
  },
  {
    id: "3",
    name: "Camila Nunes",
    cpf: "456.789.123-00",
    email: "camila.nunes@example.com",
    phone: "(21) 98123-7788",
    complaint: "Relacionamento",
    approach: "Psicanálise",
    modality: "presencial",
    price: "220,00",
    status: "ativo",
    sessionDay: "Qui",
    sessionTime: "14:30",
    nextSession: "Qui · 14:30",
    sessions: 22,
    since: "Set 2024",
  },
  {
    id: "4",
    name: "Thiago Martins",
    cpf: "321.654.987-00",
    email: "thiago.martins@example.com",
    phone: "(11) 99441-2210",
    complaint: "Depressão",
    approach: "TCC",
    modality: "hibrido",
    price: "190,00",
    status: "em-pausa",
    sessionDay: "Seg",
    sessionTime: "",
    nextSession: null,
    sessions: 31,
    since: "Fev 2024",
  },
  {
    id: "5",
    name: "Ana Beatriz",
    cpf: "159.753.486-00",
    email: "ana.beatriz@example.com",
    phone: "(31) 98777-1102",
    complaint: "Luto",
    approach: "Humanista",
    modality: "online",
    price: "170,00",
    status: "ativo",
    sessionDay: "Sex",
    sessionTime: "10:00",
    nextSession: "Sex · 10:00",
    sessions: 5,
    since: "Abr 2026",
  },
  {
    id: "6",
    name: "Pedro Henrique",
    cpf: "753.951.852-00",
    email: "pedro.h@example.com",
    phone: "(11) 99012-5567",
    complaint: "Ansiedade social",
    approach: "TCC",
    modality: "online",
    price: "160,00",
    status: "lista-espera",
    sessionDay: "Seg",
    sessionTime: "",
    nextSession: null,
    sessions: 0,
    since: "—",
  },
  {
    id: "7",
    name: "Juliana Castro",
    cpf: "852.456.951-00",
    email: "juliana.castro@example.com",
    phone: "(48) 99654-8890",
    complaint: "Pânico",
    approach: "TCC",
    modality: "presencial",
    price: "210,00",
    status: "ativo",
    sessionDay: "Sex",
    sessionTime: "16:00",
    nextSession: "Sex · 16:00",
    sessions: 12,
    since: "Out 2025",
  },
  {
    id: "8",
    name: "Lucas Almeida",
    cpf: "147.258.369-00",
    email: "lucas.almeida@example.com",
    phone: "(11) 98321-4455",
    complaint: "Estresse profissional",
    approach: "Coaching",
    modality: "hibrido",
    price: "250,00",
    status: "alta",
    sessionDay: "Ter",
    sessionTime: "",
    nextSession: null,
    sessions: 40,
    since: "Jan 2023",
  },
  {
    id: "9",
    name: "Beatriz Ramos",
    cpf: "369.258.147-00",
    email: "bia.ramos@example.com",
    phone: "(85) 99100-2233",
    complaint: "Autoestima",
    approach: "Humanista",
    modality: "online",
    price: "175,00",
    status: "em-pausa",
    sessionDay: "Qua",
    sessionTime: "",
    nextSession: null,
    sessions: 9,
    since: "Jul 2025",
  },
  {
    id: "10",
    name: "Gustavo Pereira",
    cpf: "258.147.369-00",
    email: "gustavo.pereira@example.com",
    phone: "(11) 99765-0098",
    complaint: "TOC",
    approach: "TCC",
    modality: "presencial",
    price: "200,00",
    status: "ativo",
    sessionDay: "Seg",
    sessionTime: "08:30",
    nextSession: "Seg · 08:30",
    sessions: 18,
    since: "Mai 2025",
  },
  {
    id: "11",
    name: "Fernanda Dias",
    cpf: "741.852.963-00",
    email: "fernanda.dias@example.com",
    phone: "(11) 98654-7712",
    complaint: "Casal",
    approach: "Sistêmica",
    modality: "presencial",
    price: "280,00",
    status: "lista-espera",
    sessionDay: "Qui",
    sessionTime: "",
    nextSession: null,
    sessions: 0,
    since: "—",
  },
  {
    id: "12",
    name: "Otávio Ribeiro",
    cpf: "963.852.741-00",
    email: "otavio.ribeiro@example.com",
    phone: "(21) 99888-1145",
    complaint: "Fobia específica",
    approach: "TCC",
    modality: "hibrido",
    price: "190,00",
    status: "ativo",
    sessionDay: "Ter",
    sessionTime: "15:00",
    nextSession: "Ter · 15:00",
    sessions: 6,
    since: "Mar 2026",
  },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
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
  const [patients, setPatients] = useState(initialPatients)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<PatientStatus | "todos">("todos")
  const [newPatientOpen, setNewPatientOpen] = useState(false)

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

  const activeCount = patients.filter((p) => p.status === "ativo").length

  function handleCreate(patient: Patient) {
    setPatients((current) => [patient, ...current])
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
                  <TableRow key={patient.id}>
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
                    <TableCell className="pr-4">
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
                          <DropdownMenuItem>
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
