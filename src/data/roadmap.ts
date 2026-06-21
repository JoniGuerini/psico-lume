import type { LucideIcon } from "lucide-react"
import {
  Calendar,
  CircleDollarSign,
  ClipboardList,
  Database,
  LayoutDashboard,
  Mail,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"

export type RoadmapStatus = "done" | "next" | "planned" | "later"

export type RoadmapItem = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  status: RoadmapStatus
  phase: string
  tags?: string[]
}

export const ROADMAP_META = {
  version: "1.1",
  versionLabel: "v1.1 — Modo convidado e refinamentos",
  subtitle:
    "Milestone v1.1: persistência local, CRUD clínico guest, empty states, formulários refinados e planilha Dados polida.",
  progress: 95,
}

export const roadmapItems: RoadmapItem[] = [
  {
    id: "setup",
    title: "Base do app Lume",
    description:
      "React + Vite + TypeScript, Tailwind v4, shadcn/ui e tema visual navy/creme/menta.",
    icon: LayoutDashboard,
    status: "done",
    phase: "Fundação",
    tags: ["UI", "Tema"],
  },
  {
    id: "mock-data",
    title: "Camada de dados mock",
    description:
      "30 pacientes com perfil rico, agenda derivada, notificações e inbox centralizados no provider.",
    icon: Users,
    status: "done",
    phase: "Fundação",
    tags: ["Dados"],
  },
  {
    id: "home",
    title: "Home / painel do dia",
    description:
      "Resumo de atendimentos, estatísticas da semana, receita prevista e alertas de inadimplência.",
    icon: LayoutDashboard,
    status: "done",
    phase: "Telas core",
    tags: ["Dashboard"],
  },
  {
    id: "patients",
    title: "Pacientes + perfil completo",
    description:
      "Lista com filtros, perfil detalhado, cadastro com CEP automático (ViaCEP), modal estável com Select e 30 perfis preenchidos.",
    icon: Users,
    status: "done",
    phase: "Telas core",
    tags: ["Pacientes"],
  },
  {
    id: "calendar",
    title: "Agenda semanal",
    description:
      "Grid com drag-and-drop, legenda de status, criação de atendimento e modal alinhado à identidade do novo paciente.",
    icon: Calendar,
    status: "done",
    phase: "Telas core",
    tags: ["Agenda"],
  },
  {
    id: "finance",
    title: "Financeiro",
    description:
      "Dashboard com gráficos, receita mensal, inadimplência e visão por modalidade.",
    icon: Wallet,
    status: "done",
    phase: "Telas core",
    tags: ["Financeiro"],
  },
  {
    id: "inbox",
    title: "Inbox",
    description:
      "Lista de e-mails mock, leitura lateral, busca e tabs alinhadas ao design system.",
    icon: Mail,
    status: "done",
    phase: "Telas core",
    tags: ["Comunicação"],
  },
  {
    id: "notifications",
    title: "Notificações",
    description:
      "Sino no header, dropdown refinado e página completa com filtros e agrupamento por data.",
    icon: LayoutDashboard,
    status: "done",
    phase: "Telas core",
    tags: ["Notificações"],
  },
  {
    id: "account",
    title: "Modal de conta",
    description:
      "Shell navy com inset branco, perfil, segurança, notificações e aparência.",
    icon: UserPlus,
    status: "done",
    phase: "Telas core",
    tags: ["Conta"],
  },
  {
    id: "login",
    title: "Tela de login",
    description:
      "Layout split navy/creme, campos e botões alinhados ao restante do app.",
    icon: LayoutDashboard,
    status: "done",
    phase: "Telas core",
    tags: ["Auth mock"],
  },
  {
    id: "records",
    title: "Prontuário / evolução clínica",
    description:
      "Notas de sessão, histórico de evolução, aba dedicada no perfil e cadastro de novas evoluções.",
    icon: ClipboardList,
    status: "done",
    phase: "v1.0 — Prioridade",
    tags: ["Clínico", "Entregue"],
  },
  {
    id: "edit-patient",
    title: "Editar paciente",
    description:
      "Formulário de cadastro reutilizado para atualizar dados existentes a partir do perfil.",
    icon: Pencil,
    status: "done",
    phase: "v1.0 — Prioridade",
    tags: ["Pacientes", "Entregue"],
  },
  {
    id: "schedule-from-profile",
    title: "Agendar sessão pelo perfil",
    description:
      "Botão no perfil abre fluxo de agendamento já preenchendo paciente e horário recorrente.",
    icon: Calendar,
    status: "done",
    phase: "v1.0 — Prioridade",
    tags: ["Agenda", "Entregue"],
  },
  {
    id: "session-status",
    title: "Status da sessão",
    description:
      "Marcar como realizada, faltou ou remarcada — base para comparecimento e cobrança.",
    icon: Calendar,
    status: "done",
    phase: "v1.0",
    tags: ["Agenda", "Clínico", "Entregue"],
  },
  {
    id: "session-history",
    title: "Histórico de sessões no perfil",
    description:
      "Aba dedicada no perfil com timeline de atendimentos, remarcações conectadas e faixa lateral por status.",
    icon: Calendar,
    status: "done",
    phase: "v1.0",
    tags: ["Agenda", "Pacientes", "Entregue"],
  },
  {
    id: "export",
    title: "Exportação de dados",
    description:
      "XLSX estilizado com 9 abas (pacientes, agenda, prontuário, financeiro por sessão e relatórios). Botão no header global.",
    icon: ClipboardList,
    status: "done",
    phase: "v1.0",
    tags: ["Gestão", "Entregue"],
  },
  {
    id: "unpaid-sessions",
    title: "Sessões a receber",
    description:
      "Página consolidada de sessões realizadas não pagas, filtros, marcar como paga, navegação na Home e pagamento por sessão no evento.",
    icon: CircleDollarSign,
    status: "done",
    phase: "v1.0",
    tags: ["Financeiro", "Entregue"],
  },
  {
    id: "login-transition",
    title: "Transição login → app",
    description:
      "Crossfade com AnimatePresence — entrada e saída suaves por opacidade, sem morph de layout.",
    icon: LayoutDashboard,
    status: "done",
    phase: "v1.0",
    tags: ["UX", "Entregue"],
  },
  {
    id: "finance-agenda",
    title: "Agenda ↔ Financeiro",
    description:
      "Cobrança por status (realizada / faltou sem aviso), valor por sessão, atraso após o mês, inadimplência automática com override no perfil, Financeiro e Home com dados reais.",
    icon: Wallet,
    status: "done",
    phase: "v1.0",
    tags: ["Financeiro", "Agenda", "Entregue"],
  },
  {
    id: "global-search",
    title: "Busca global",
    description:
      "Pill no header, Cmd+K, modal creme com índice otimizado, destaque do item selecionado, botão X para limpar e ações rápidas.",
    icon: Search,
    status: "done",
    phase: "v1.0",
    tags: ["UX", "Entregue"],
  },
  {
    id: "recurring-calendar",
    title: "Agenda recorrente",
    description:
      "Sessões geradas a partir do horário do paciente — sem preencher datas anteriores ao cadastro (recurrenceFrom).",
    icon: Calendar,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Agenda", "Entregue"],
  },
  {
    id: "search-input-clear",
    title: "Limpar busca nos campos",
    description:
      "SearchInput reutilizável com X no fim e hover azul Luma — Pacientes, Inbox e busca global.",
    icon: Search,
    status: "done",
    phase: "v1.0",
    tags: ["UX", "Entregue"],
  },
  {
    id: "calendar-card-consistency",
    title: "Consistência visual da agenda",
    description:
      "Cards com mesma intensidade por status — deduplicação de horários (presencial+online), fundos opacos equivalentes e sync de status em sessões passadas.",
    icon: Calendar,
    status: "done",
    phase: "v1.0",
    tags: ["Agenda", "UI", "Entregue"],
  },
  {
    id: "custom-scrollbar",
    title: "Scrollbar customizada",
    description:
      "ScrollArea próprio (Radix), barra nativa do SO oculta e thumb Luma sem setas — inbox, modais e listas.",
    icon: LayoutDashboard,
    status: "done",
    phase: "v1.0",
    tags: ["UI", "Entregue"],
  },
  {
    id: "reports",
    title: "Relatórios na UI",
    description:
      "Taxa de comparecimento, evolução mensal, desfecho das sessões e receita por modalidade — página dedicada com filtros por mês.",
    icon: ClipboardList,
    status: "done",
    phase: "v1.0",
    tags: ["Gestão", "Entregue"],
  },
  {
    id: "supabase",
    title: "Supabase + auth real",
    description:
      "Persistência, login de verdade e sincronização — só depois de fechar a v1.0 mock.",
    icon: Database,
    status: "later",
    phase: "Pós v1.0",
    tags: ["Backend", "Auth"],
  },
  {
    id: "guest-mode",
    title: "Modo convidado (localStorage)",
    description:
      "Entrada sem login, dados persistidos no navegador, nome na 1ª visita e exclusão de conta na aba Conta.",
    icon: UserPlus,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Auth", "Entregue"],
  },
  {
    id: "themes",
    title: "Temas Refúgio, Lume e Coral",
    description:
      "Três paletas com contraste ajustado na sidebar e menu ativo legível em cada tema.",
    icon: LayoutDashboard,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["UI", "Entregue"],
  },
  {
    id: "edit-delete-note",
    title: "Editar e excluir evolução",
    description:
      "Ações no prontuário com confirmação ao excluir; modal reutilizado para edição com recálculo de sessões.",
    icon: Pencil,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Clínico", "Entregue"],
  },
  {
    id: "delete-patient",
    title: "Excluir paciente",
    description:
      "Zona de perigo no perfil remove paciente, prontuário, agenda e eventos associados.",
    icon: Trash2,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Pacientes", "Entregue"],
  },
  {
    id: "guest-profile-name",
    title: "Salvar nome do convidado no perfil",
    description:
      "Campo de nome na aba Perfil da Conta persiste no localStorage e atualiza o header.",
    icon: UserPlus,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Conta", "Entregue"],
  },
  {
    id: "patient-notes-field",
    title: "Observações do paciente",
    description:
      "Persistir o campo de observações do formulário de cadastro/edição no tipo Patient.",
    icon: ClipboardList,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Pacientes", "Entregue"],
  },
  {
    id: "patient-list-actions",
    title: "Agendar e anotações na lista",
    description:
      "Menus de ação rápida na lista de pacientes abrem agendamento ou nova evolução direto.",
    icon: Calendar,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Pacientes", "Entregue"],
  },
  {
    id: "inbox-retained",
    title: "Inbox (UI mock mantida)",
    description:
      "Página preservada como protótipo visual; integração real com e-mail fica para depois.",
    icon: Mail,
    status: "planned",
    phase: "v1.1 — Modo convidado",
    tags: ["Comunicação", "Mock"],
  },
  {
    id: "toast-system",
    title: "Sistema de toasts",
    description:
      "Confirmações rápidas no canto da tela, padrão inferior direito, com posição configurável em Conta → Aparência.",
    icon: LayoutDashboard,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["UX", "Entregue"],
  },
  {
    id: "guest-notifications",
    title: "Notificações automáticas no guest",
    description:
      "Gerar alertas locais ao cadastrar paciente, agendar sessão ou registrar evolução.",
    icon: LayoutDashboard,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Notificações", "Entregue"],
  },
  {
    id: "delete-session",
    title: "Excluir sessão na agenda",
    description:
      "Remover atendimento criado por engano, com confirmação e ajuste de contadores no modo convidado.",
    icon: Trash2,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Agenda", "Entregue"],
  },
  {
    id: "guest-empty-states",
    title: "Empty states no modo convidado",
    description:
      "Pacientes, Home, Financeiro, A receber e Relatórios reconhecem clínica vazia e convidam a cadastrar o primeiro paciente.",
    icon: Users,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["UX", "Entregue"],
  },
  {
    id: "home-agenda-navigation",
    title: "Home → agenda do dia",
    description:
      "Clicar sessão na Home ou na busca global abre a agenda na visão Dia, sem abrir o modal de edição.",
    icon: Calendar,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["UX", "Agenda", "Entregue"],
  },
  {
    id: "form-pickers",
    title: "Date e time pickers nos formulários",
    description:
      "Calendário clicável para datas, seletor de hora/minuto nos horários recorrentes e placeholders mais sutis.",
    icon: Pencil,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["UX", "Formulários", "Entregue"],
  },
  {
    id: "input-masks",
    title: "Máscaras de CPF e celular",
    description:
      "Formatação automática ao digitar no cadastro de paciente — DDD separado e CPF pontuado.",
    icon: ClipboardList,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["Formulários", "Entregue"],
  },
  {
    id: "sheet-scroll-ux",
    title: "Planilha Dados mais legível",
    description:
      "Barra horizontal mais visível e arrastável na visão em planilha; respiro à direita para a última coluna não ficar cortada.",
    icon: Database,
    status: "done",
    phase: "v1.1 — Modo convidado",
    tags: ["UX", "Dados", "Entregue"],
  },
]

export const statusConfig: Record<
  RoadmapStatus,
  { label: string; dot: string; badge: string }
> = {
  done: {
    label: "Entregue",
    dot: "bg-sidebar-primary",
    badge: "border-border bg-background/40 text-foreground",
  },
  next: {
    label: "Próximo",
    dot: "bg-primary",
    badge: "border-primary/30 bg-primary/10 text-foreground",
  },
  planned: {
    label: "Planejado",
    dot: "bg-muted-foreground/50",
    badge: "border-border bg-background/40 text-muted-foreground",
  },
  later: {
    label: "Depois da v1.0",
    dot: "bg-sidebar-foreground/40",
    badge: "border-border bg-sidebar/10 text-muted-foreground",
  },
}

export function getRoadmapByStatus(status: RoadmapStatus) {
  return roadmapItems.filter((item) => item.status === status)
}

export function getRoadmapByPhase() {
  const phases = new Map<string, RoadmapItem[]>()
  for (const item of roadmapItems) {
    const bucket = phases.get(item.phase) ?? []
    bucket.push(item)
    phases.set(item.phase, bucket)
  }
  return Array.from(phases.entries())
}
