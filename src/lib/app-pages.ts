/** IDs estáveis de páginas — independentes do idioma. */
export const APP_PAGE_ID = {
  inicio: "inicio",
  caixaEntrada: "caixaEntrada",
  agenda: "agenda",
  pacientes: "pacientes",
  financeiro: "financeiro",
  aReceber: "aReceber",
  relatorios: "relatorios",
  notificacoes: "notificacoes",
  dados: "dados",
  roteiro: "roteiro",
} as const

export type AppPageId = (typeof APP_PAGE_ID)[keyof typeof APP_PAGE_ID]

/** O Roteiro é uma ferramenta interna: só aparece em desenvolvimento. */
export const IS_ROADMAP_VISIBLE = import.meta.env.DEV

export const APP_PAGE_IDS = Object.values(APP_PAGE_ID) as AppPageId[]

export const FILL_VIEWPORT_PAGE_IDS = new Set<AppPageId>([
  APP_PAGE_ID.inicio,
  APP_PAGE_ID.caixaEntrada,
  APP_PAGE_ID.agenda,
  APP_PAGE_ID.pacientes,
  APP_PAGE_ID.notificacoes,
  APP_PAGE_ID.dados,
])
