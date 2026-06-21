export const LOCALE_STORAGE_KEY = "lume-locale"

export type Locale = "pt-BR" | "en"

export const DEFAULT_LOCALE: Locale = "pt-BR"

export const LOCALE_OPTIONS: {
  id: Locale
  labelKey:
    | "account.preferences.language.ptBR"
    | "account.preferences.language.en"
}[] = [
  { id: "pt-BR", labelKey: "account.preferences.language.ptBR" },
  { id: "en", labelKey: "account.preferences.language.en" },
]

const VALID_LOCALES = new Set<Locale>(["pt-BR", "en"])

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && VALID_LOCALES.has(value as Locale)
}

export function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(raw) ? raw : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function persistLocale(locale: Locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function applyLocaleToDocument(locale: Locale) {
  document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en"
}

export function bootstrapLocaleFromStorage() {
  applyLocaleToDocument(readStoredLocale())
}

/** Locale BCP 47 para Intl (datas, moeda). */
export function intlLocale(locale: Locale) {
  return locale === "pt-BR" ? "pt-BR" : "en-US"
}
