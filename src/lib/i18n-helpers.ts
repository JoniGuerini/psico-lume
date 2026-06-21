import { APP_PAGE_ID, type AppPageId } from "@/lib/app-pages"
import type {
  PatientModality,
  PatientStatus,
  RescheduledFrom,
  SessionFrequency,
  SessionStatus,
} from "@/data/types"
import { normalizeSessionFrequency } from "@/lib/session-frequency"
import { translate, type TranslateFn } from "@/i18n/translate"
import type { Locale } from "@/lib/locale"
import { intlLocale } from "@/lib/locale"

export const MOOD_KEYS = [
  "anxious",
  "stable",
  "better",
  "sad",
  "hopeful",
  "exhausted",
  "emotional",
  "reflective",
  "hypervigilant",
] as const

export type MoodKey = (typeof MOOD_KEYS)[number]

export function getSessionStatusLabel(t: TranslateFn, status: SessionStatus) {
  return t(`enums.sessionStatus.${status}`)
}

export function getPatientStatusLabel(t: TranslateFn, status: PatientStatus) {
  return t(`enums.patientStatus.${status}`)
}

export function getModalityLabel(t: TranslateFn, modality: PatientModality) {
  return t(`enums.modality.${modality}`)
}

export function getMoodLabel(t: TranslateFn, mood: string) {
  if ((MOOD_KEYS as readonly string[]).includes(mood)) {
    return t(`enums.mood.${mood}`)
  }
  return mood
}

export function formatRescheduledFromLabel(
  from: RescheduledFrom,
  locale: Locale
) {
  const raw = formatLocaleDate(from.date, locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
  const dateLabel = raw.charAt(0).toUpperCase() + raw.slice(1)
  return `${dateLabel} · ${from.start} – ${from.end}`
}

export function getSessionFrequencyLabel(
  t: TranslateFn,
  frequency: SessionFrequency | string | undefined
) {
  const normalized = normalizeSessionFrequency(frequency)
  return t(`enums.sessionFrequency.${normalized}`)
}

export function formatLocaleDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
) {
  return date.toLocaleDateString(intlLocale(locale), options)
}

export function formatLocaleCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatLocaleCurrencyCompact(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatRelativeTimeLabel(
  date: Date,
  locale: Locale,
  now = new Date()
) {
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params)

  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return t("common.now")
  if (diffMinutes < 60) return t("common.minutesAgo", { count: diffMinutes })

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return t("common.hoursAgo", { count: diffHours })

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return t("common.yesterday")
  if (diffDays < 7) return t("common.daysAgo", { count: diffDays })

  return formatLocaleDate(date, locale, { day: "2-digit", month: "short" })
}

export const ALL_APP_PAGE_IDS = Object.values(APP_PAGE_ID) as AppPageId[]
