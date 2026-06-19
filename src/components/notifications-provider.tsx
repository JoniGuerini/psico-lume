import { useClinicData } from "@/context/clinic-data-provider"
import { formatRelativeTime } from "@/data/patients"

export type { Notification, NotificationCategory } from "@/data/types"
export { formatRelativeTime }

export function useNotifications() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
  } = useClinicData()

  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    remove: removeNotification,
    clearAll: clearNotifications,
  }
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
