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

const APP_PAGE_ID_SET = new Set<string>(APP_PAGE_IDS)

export const FILL_VIEWPORT_PAGE_IDS = new Set<AppPageId>([
  APP_PAGE_ID.inicio,
  APP_PAGE_ID.caixaEntrada,
  APP_PAGE_ID.agenda,
  APP_PAGE_ID.pacientes,
  APP_PAGE_ID.notificacoes,
  APP_PAGE_ID.dados,
])

export function isAppPageId(value: string): value is AppPageId {
  return APP_PAGE_ID_SET.has(value)
}

/** Lê a página atual do hash (`#/agenda`). */
export function readAppPageFromLocation(): AppPageId {
  if (typeof window === "undefined") return APP_PAGE_ID.inicio

  const raw = window.location.hash.replace(/^#\/?/, "").trim()
  const page = raw.split(/[/?&]/)[0] ?? ""
  if (!isAppPageId(page)) return APP_PAGE_ID.inicio
  if (page === APP_PAGE_ID.roteiro && !IS_ROADMAP_VISIBLE) {
    return APP_PAGE_ID.inicio
  }
  return page
}

/** Persiste a página no hash para sobreviver a refresh e permitir voltar/avançar. */
export function writeAppPageToLocation(page: AppPageId) {
  if (typeof window === "undefined") return
  const nextHash = `#/${page}`
  if (window.location.hash === nextHash) return
  window.location.hash = `/${page}`
}
