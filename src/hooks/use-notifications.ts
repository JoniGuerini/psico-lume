import { useClinicData } from "@/context/clinic-data-provider"

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
