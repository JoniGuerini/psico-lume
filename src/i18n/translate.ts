import { ptBR } from "@/i18n/messages/pt-BR"
import { en } from "@/i18n/messages/en"
import type { Locale } from "@/lib/locale"
import type { Messages } from "@/i18n/types"

export type { Messages } from "@/i18n/types"

const catalogs: Record<Locale, Messages> = {
  "pt-BR": ptBR,
  en,
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale]
}

export type TranslateParams = Record<string, string | number>

function resolvePath(messages: Messages, key: string): string | undefined {
  const parts = key.split(".")
  let current: unknown = messages

  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === "string" ? current : undefined
}

function interpolate(template: string, params?: TranslateParams) {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] != null ? String(params[name]) : `{{${name}}}`
  )
}

export function createTranslator(locale: Locale) {
  const messages = getMessages(locale)

  return function translate(key: string, params?: TranslateParams) {
    const value = resolvePath(messages, key)
    if (value == null) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing key: ${key}`)
      }
      return key
    }
    return interpolate(value, params)
  }
}

export type TranslateFn = ReturnType<typeof createTranslator>

/** Alias curto para uso fora de React (ex.: formatters). */
export function translate(locale: Locale, key: string, params?: TranslateParams) {
  return createTranslator(locale)(key, params)
}
