import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { createTranslator, type TranslateFn } from "@/i18n/translate"
import type { AppPageId } from "@/lib/app-pages"
import {
  applyLocaleToDocument,
  DEFAULT_LOCALE,
  persistLocale,
  readStoredLocale,
  type Locale,
} from "@/lib/locale"

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
  pageLabel: (pageId: AppPageId) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  useEffect(() => {
    applyLocaleToDocument(locale)
    persistLocale(locale)
  }, [locale])

  const t = useMemo(() => createTranslator(locale), [locale])

  const pageLabel = useCallback(
    (pageId: AppPageId) => t(`nav.pages.${pageId}`),
    [t]
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState,
      t,
      pageLabel,
    }),
    [locale, t, pageLabel]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale deve ser usado dentro de LocaleProvider")
  }
  return context
}

export function useTranslation() {
  const { locale, setLocale, t, pageLabel } = useLocale()
  return { locale, setLocale, t, pageLabel }
}

export { DEFAULT_LOCALE, type Locale }
