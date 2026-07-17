export const THEME_STORAGE_KEY = "lume-theme"
export const DENSITY_STORAGE_KEY = "lume-density"

export type ThemeId = "lume" | "refugio" | "horizonte" | "grafite"
export type DensityId = "comfortable" | "compact"

export const DEFAULT_THEME: ThemeId = "refugio"
export const DEFAULT_DENSITY: DensityId = "comfortable"

const VALID_THEMES = new Set<ThemeId>(["lume", "refugio", "horizonte", "grafite"])
const VALID_DENSITIES = new Set<DensityId>(["comfortable", "compact"])

/** Temas removidos — quem ainda tiver no storage volta ao padrão (ou ao sucessor). */
const REMOVED_THEMES = new Set(["forja", "entardecer", "profundo", "luar"])

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value != null && VALID_THEMES.has(value as ThemeId)
}

export function isDensityId(value: string | null | undefined): value is DensityId {
  return value != null && VALID_DENSITIES.has(value as DensityId)
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

export function readStoredDensity(): DensityId {
  try {
    const raw = localStorage.getItem(DENSITY_STORAGE_KEY)
    return isDensityId(raw) ? raw : DEFAULT_DENSITY
  } catch {
    return DEFAULT_DENSITY
  }
}

export function applyThemeToDocument(
  theme: ThemeId,
  density: DensityId = DEFAULT_DENSITY
) {
  document.documentElement.dataset.theme = theme

  if (density === "compact") {
    document.documentElement.dataset.density = "compact"
  } else {
    delete document.documentElement.dataset.density
  }
}

export function persistTheme(theme: ThemeId) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function persistDensity(density: DensityId) {
  localStorage.setItem(DENSITY_STORAGE_KEY, density)
}

/** Evita flash de tema errado antes do React montar. */
export function bootstrapThemeFromStorage() {
  applyThemeToDocument(readStoredTheme(), readStoredDensity())
}
