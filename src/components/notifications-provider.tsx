import { createContext, useContext, useMemo, useState } from "react"
import {
  CalendarClock,
  CalendarX,
  CreditCard,
  MessageSquare,
  UserPlus,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NotificationCategory =
  | "sessao"
  | "paciente"
  | "mensagem"
  | "financeiro"
  | "sistema"

export type Notification = {
  id: string
  icon: LucideIcon
  category: NotificationCategory
  title: string
  description: string
  date: Date
  read: boolean
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    icon: CalendarClock,
    category: "sessao",
    title: "Mariana Lopes confirmou a sessão",
    description: "Sessão de hoje às 09:00 confirmada.",
    date: minutesAgo(5),
    read: false,
  },
  {
    id: "2",
    icon: UserPlus,
    category: "paciente",
    title: "Novo paciente na lista de espera",
    description: "Fernanda Dias entrou na sua lista de espera.",
    date: minutesAgo(64),
    read: false,
  },
  {
    id: "3",
    icon: CreditCard,
    category: "financeiro",
    title: "Pagamento recebido",
    description: "Rafael Souza pagou R$ 200,00 referente à sessão.",
    date: minutesAgo(182),
    read: false,
  },
  {
    id: "4",
    icon: MessageSquare,
    category: "mensagem",
    title: "Mensagem de Camila Nunes",
    description: "“Consigo remarcar a sessão de quinta para 15h?”",
    date: minutesAgo(300),
    read: false,
  },
  {
    id: "5",
    icon: CalendarClock,
    category: "sessao",
    title: "Lembrete de sessão",
    description: "Sessão com Juliana Castro hoje às 16:00.",
    date: minutesAgo(60 * 22),
    read: true,
  },
  {
    id: "6",
    icon: CreditCard,
    category: "financeiro",
    title: "Pagamento em atraso",
    description: "O pagamento de Beatriz Ramos está atrasado há 3 dias.",
    date: minutesAgo(60 * 26),
    read: true,
  },
  {
    id: "7",
    icon: CalendarX,
    category: "sessao",
    title: "Thiago Martins cancelou a sessão",
    description: "A sessão de amanhã às 10:00 foi cancelada.",
    date: minutesAgo(60 * 49),
    read: true,
  },
  {
    id: "8",
    icon: UserPlus,
    category: "paciente",
    title: "Primeira avaliação agendada",
    description: "Pedro Henrique agendou a avaliação inicial para segunda.",
    date: minutesAgo(60 * 96),
    read: true,
  },
]

type NotificationsContextValue = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  remove: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const value = useMemo<NotificationsContextValue>(() => {
    return {
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markAsRead: (id) =>
        setNotifications((current) =>
          current.map((item) =>
            item.id === id ? { ...item, read: true } : item
          )
        ),
      markAllAsRead: () =>
        setNotifications((current) =>
          current.map((item) => ({ ...item, read: true }))
        ),
      remove: (id) =>
        setNotifications((current) =>
          current.filter((item) => item.id !== id)
        ),
      clearAll: () => setNotifications([]),
    }
  }, [notifications])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationsProvider"
    )
  }
  return context
}

export function formatRelativeTime(date: Date) {
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000)

  if (diffMinutes < 1) return "agora"
  if (diffMinutes < 60) return `há ${diffMinutes} min`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return "ontem"
  if (diffDays < 7) return `há ${diffDays} dias`

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}
