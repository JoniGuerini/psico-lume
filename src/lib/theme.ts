export const THEME_STORAGE_KEY = "lume-theme"
/** @deprecated removido — limpo no bootstrap */
export const DENSITY_STORAGE_KEY = "lume-density"

export type ThemeId = "lume" | "refugio" | "horizonte" | "grafite"

export const DEFAULT_THEME: ThemeId = "refugio"

const VALID_THEMES = new Set<ThemeId>(["lume", "refugio", "horizonte", "grafite"])

/** Temas removidos — quem ainda tiver no storage volta ao padrão (ou ao sucessor). */
const REMOVED_THEMES = new Set(["forja", "entardecer", "profundo", "luar"])

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value != null && VALID_THEMES.has(value as ThemeId)
}

export function readStoredTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === "luar") {
      persistTheme("grafite")
      return "grafite"
    }
    if (raw != null && REMOVED_THEMES.has(raw)) {
      persistTheme(DEFAULT_THEME)
      return DEFAULT_THEME
    }
    return isThemeId(raw) ? raw : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyThemeToDocument(theme: ThemeId) {
  document.documentElement.dataset.theme = theme
  delete document.documentElement.dataset.density
}

export function persistTheme(theme: ThemeId) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

/** Evita flash de tema errado antes do React montar. */
export function bootstrapThemeFromStorage() {
  try {
    localStorage.removeItem(DENSITY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  applyThemeToDocument(readStoredTheme())
}
