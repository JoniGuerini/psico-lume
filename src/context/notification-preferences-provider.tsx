import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  persistNotificationPreferences,
  readStoredNotificationPreferences,
  setNotificationPreference,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "@/lib/notification-preferences"

type NotificationPreferencesContextValue = {
  preferences: NotificationPreferences
  setPreference: (key: NotificationPreferenceKey, enabled: boolean) => void
}

const NotificationPreferencesContext =
  createContext<NotificationPreferencesContextValue | null>(null)

export function NotificationPreferencesProvider({
  children,
}: {
  children: ReactNode
}) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    readStoredNotificationPreferences()
  )

  useEffect(() => {
    persistNotificationPreferences(preferences)
  }, [preferences])

  const value = useMemo(
    () => ({
      preferences,
      setPreference: (key: NotificationPreferenceKey, enabled: boolean) => {
        setPreferences((current) => setNotificationPreference(current, key, enabled))
      },
    }),
    [preferences]
  )

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  )
}

export function useNotificationPreferences() {
  const context = useContext(NotificationPreferencesContext)
  if (!context) {
    throw new Error(
      "useNotificationPreferences must be used within NotificationPreferencesProvider"
    )
  }
  return context
}

export {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferenceKey,
  type NotificationPreferences,
}
