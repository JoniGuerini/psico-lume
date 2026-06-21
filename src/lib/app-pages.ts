/** Rótulos de páginas exibidos na navegação e no shell (pt-BR). */
export const APP_PAGE = {
  inicio: "Início",
  caixaEntrada: "Caixa de entrada",
  agenda: "Agenda",
  pacientes: "Pacientes",
  financeiro: "Financeiro",
  aReceber: "A receber",
  relatorios: "Relatórios",
  notificacoes: "Notificações",
  dados: "Dados",
  roteiro: "Roteiro",
} as const

export type AppPage = (typeof APP_PAGE)[keyof typeof APP_PAGE]

export const FILL_VIEWPORT_PAGES = new Set<string>([
  APP_PAGE.inicio,
  APP_PAGE.caixaEntrada,
  APP_PAGE.agenda,
  APP_PAGE.pacientes,
  APP_PAGE.financeiro,
  APP_PAGE.aReceber,
  APP_PAGE.relatorios,
  APP_PAGE.notificacoes,
  APP_PAGE.dados,
])
