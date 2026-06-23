export const NOTIFICATION_PREFERENCES_STORAGE_KEY = "lume-notification-preferences"

export type NotificationPreferenceKey =
  | "pendingStatus"
  | "todaySession"
  | "pendingEvolution"
  | "overduePayment"
  | "unpaidWeek"
  | "waitlist"
  | "pausedPatient"
  | "inboxUnread"
  | "weeklySummary"
  | "guestWelcome"

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>

export const NOTIFICATION_PREFERENCE_KEYS: NotificationPreferenceKey[] = [
  "pendingStatus",
  "todaySession",
  "pendingEvolution",
  "overduePayment",
  "unpaidWeek",
  "waitlist",
  "pausedPatient",
  "inboxUnread",
  "weeklySummary",
  "guestWelcome",
]

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pendingStatus: true,
  todaySession: true,
  pendingEvolution: true,
  overduePayment: true,
  unpaidWeek: true,
  waitlist: true,
  pausedPatient: true,
  inboxUnread: true,
  weeklySummary: false,
  guestWelcome: true,
}

function isPreferenceKey(value: string): value is NotificationPreferenceKey {
  return NOTIFICATION_PREFERENCE_KEYS.includes(value as NotificationPreferenceKey)
}

export function readStoredNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES }

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...Object.fromEntries(
        NOTIFICATION_PREFERENCE_KEYS.filter((key) => typeof parsed[key] === "boolean").map(
          (key) => [key, parsed[key]]
        )
      ),
    }
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES }
  }
}

export function persistNotificationPreferences(
  preferences: NotificationPreferences
) {
  localStorage.setItem(
    NOTIFICATION_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences)
  )
}

export function getAlertPreferenceKey(
  alertId: string
): NotificationPreferenceKey | null {
  if (alertId === "guest-welcome") return "guestWelcome"
  if (alertId === "alert-unclosed-week") return "pendingStatus"
  if (alertId.startsWith("alert-pending-status-")) return "pendingStatus"
  if (alertId.startsWith("alert-today-")) return "todaySession"
  if (alertId.startsWith("alert-overdue-")) return "overduePayment"
  if (alertId.startsWith("alert-evolution-")) return "pendingEvolution"
  if (alertId === "alert-unpaid-week") return "unpaidWeek"
  if (alertId.startsWith("alert-waitlist-")) return "waitlist"
  if (alertId.startsWith("alert-paused-")) return "pausedPatient"
  if (alertId === "alert-inbox-unread") return "inboxUnread"
  if (alertId === "alert-weekly-summary") return "weeklySummary"
  return null
}

export function isAlertEnabled(
  alertId: string,
  preferences: NotificationPreferences
): boolean {
  const key = getAlertPreferenceKey(alertId)
  if (key == null) return true
  return preferences[key]
}

export function setNotificationPreference(
  preferences: NotificationPreferences,
  key: NotificationPreferenceKey,
  enabled: boolean
): NotificationPreferences {
  if (!isPreferenceKey(key)) return preferences
  return { ...preferences, [key]: enabled }
}
