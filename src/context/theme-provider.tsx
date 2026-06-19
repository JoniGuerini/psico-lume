import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  applyThemeToDocument,
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  persistDensity,
  persistTheme,
  readStoredDensity,
  readStoredTheme,
  type DensityId,
  type ThemeId,
} from "@/lib/theme"

type ThemeContextValue = {
  theme: ThemeId
  density: DensityId
  setTheme: (theme: ThemeId) => void
  setDensity: (density: DensityId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => readStoredTheme())
  const [density, setDensityState] = useState<DensityId>(() => readStoredDensity())

  useEffect(() => {
    applyThemeToDocument(theme, density)
    persistTheme(theme)
    persistDensity(density)
  }, [theme, density])

  const value = useMemo(
    () => ({
      theme,
      density,
      setTheme: setThemeState,
      setDensity: setDensityState,
    }),
    [theme, density]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

export { DEFAULT_DENSITY, DEFAULT_THEME, type DensityId, type ThemeId }
