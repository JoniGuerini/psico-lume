/**
 * Lume Design System — API para componentes React.
 *
 * Regras:
 * - UI: use `lumeSurfaces` e tokens Tailwind (bg-background, text-primary-foreground…).
 * - JS (export, charts): use `lumePrimitives` / `sheetPalette`.
 * - Não use hex inline em componentes — adicione token no arquivo do tema
 *   (`src/styles/themes/<tema>.css`) se faltar.
 */

import type { PatientStatus, SessionStatus } from "@/data/types"

/* ── Superfícies (classes Tailwind) ── */

/** Painel creme principal (login + app inset). */
export const LUME_MAIN_SURFACE_CLASS =
  "relative flex min-h-0 min-w-0 flex-1 flex-col self-stretch overflow-hidden rounded-2xl bg-background shadow-sm m-2 ml-0"

/** Scroll de página quando o shell principal usa overflow-hidden (FILL_VIEWPORT). */
export const LUME_PAGE_SCROLL_CLASS =
  "flex min-h-0 min-w-0 flex-1 w-full flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain"

/** Conteúdo de página com scroll no shell (fora de FILL_VIEWPORT). */
export const LUME_PAGE_CONTENT_CLASS = "flex min-w-0 w-full flex-col gap-4"

/** Modais e painéis largos (creme mais claro que o fundo). */
export const LUME_DIALOG_SURFACE_CLASS = "bg-surface-dialog"

export const lumeSurfaces = {
  dialog: LUME_DIALOG_SURFACE_CLASS,
  mainInset: LUME_MAIN_SURFACE_CLASS,
  /** Card/painel navy (hero, perfil, abas de sessão). */
  navyPanel: "bg-sidebar text-sidebar-foreground",
  /** Título sobre fundo navy. */
  navyHeading: "text-surface-navy-heading font-heading font-semibold",
} as const

/* ── Primitivos (hex para contextos sem CSS) ── */

export const lumePrimitives = {
  navy900: "#1B3A5C",
  navy800: "#1C3351",
  cream100: "#FAF6EC",
  cream200: "#F5F2EA",
  sand100: "#EFE7D5",
  mint400: "#A0CFB1",
  mintLogo: "#A8D5BA",
  terracotta: "#C97B63",
  horizonteSky: "#F0EBE3",
  horizonteOcean: "#1E3D4D",
  horizonteApricot: "#E07A5F",
  grafiteSurface: "#1C1B1A",
  grafiteDeep: "#141312",
  grafiteCopper: "#C48A5A",
  white: "#FFFFFF",
} as const

/** Paleta da exportação XLSX e visão Dados — espelha a paleta clássica Lume. */
export const sheetPalette = {
  headerBg: lumePrimitives.navy900,
  headerText: lumePrimitives.cream100,
  border: "#E5E0D5",
  zebra: "#F8F6F0",
  card: lumePrimitives.white,
  overdue: "#FEE2E2",
  overdueText: "#B91C1C",
  metricLabel: lumePrimitives.navy900,
  sessionStatusFill: {
    agendada: "#F8F6F0",
    realizada: "#EAF5EF",
    faltou: "#FEE2E2",
    remarcada: "#E8EEF5",
    cancelada: "#F3F4F6",
  } satisfies Record<SessionStatus, string>,
  patientStatusFill: {
    ativo: "#EAF5EF",
    "em-pausa": "#FEF3C7",
    "lista-espera": "#E0F2FE",
    alta: "#F3F4F6",
  } satisfies Record<PatientStatus, string>,
} as const

/* ── Temas disponíveis (Aparência → Conta) ── */

import type { ThemeId } from "@/lib/theme"

export type { ThemeId }

export type ThemePreset = {
  id: ThemeId
  label: string
  description: string
  preview: {
    sidebar: string
    background: string
    accent: string
  }
}

export const themePresets: ThemePreset[] = [
  {
    id: "refugio",
    label: "Refúgio",
    description: "Ardósia fria com destaque terracota — padrão.",
    preview: {
      sidebar: "#2D3A4A",
      background: "#E8EDF2",
      accent: lumePrimitives.terracotta,
    },
  },
  {
    id: "lume",
    label: "Lume",
    description: "Areia quente, navy e menta — identidade clássica.",
    preview: {
      sidebar: lumePrimitives.navy900,
      background: lumePrimitives.sand100,
      accent: lumePrimitives.mint400,
    },
  },
  {
    id: "horizonte",
    label: "Horizonte",
    description: "Linho quente, oceano profundo e pôr do sol.",
    preview: {
      sidebar: lumePrimitives.horizonteOcean,
      background: lumePrimitives.horizonteSky,
      accent: lumePrimitives.horizonteApricot,
    },
  },
  {
    id: "grafite",
    label: "Grafite",
    description: "Pretos e cinzas quentes com destaque cobre discreto.",
    preview: {
      sidebar: lumePrimitives.grafiteDeep,
      background: lumePrimitives.grafiteSurface,
      accent: lumePrimitives.grafiteCopper,
    },
  },
]
