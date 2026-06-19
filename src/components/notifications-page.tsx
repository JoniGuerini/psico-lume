import { useMemo, useState } from "react"
import { BellOff, Check, CheckCheck, Trash2 } from "lucide-react"

import {
  formatRelativeTime,
  useNotifications,
  type Notification,
  type NotificationCategory,
} from "@/components/notifications-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Filter = "todas" | "nao-lidas" | NotificationCategory

const filters: { value: Filter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "nao-lidas", label: "Não lidas" },
  { value: "sessao", label: "Sessões" },
  { value: "paciente", label: "Pacientes" },
  { value: "mensagem", label: "Mensagens" },
  { value: "financeiro", label: "Pagamentos" },
]

const groupOrder = ["Hoje", "Ontem", "Esta semana", "Mais antigas"] as const

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function groupLabel(date: Date) {
  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(date).getTime()) /
      86_400_000
  )

  if (diffDays <= 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return "Esta semana"
  return "Mais antigas"
}

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, remove } =
    useNotifications()
  const [filter, setFilter] = useState<Filter>("todas")

  const filtered = useMemo(() => {
    if (filter === "todas") return notifications
    if (filter === "nao-lidas") {
      return notifications.filter((item) => !item.read)
    }
    return notifications.filter((item) => item.category === filter)
  }, [filter, notifications])

  const grouped = useMemo(() => {
    const map = new Map<string, Notification[]>()
    for (const item of filtered) {
      const label = groupLabel(item.date)
      const bucket = map.get(label) ?? []
      bucket.push(item)
      map.set(label, bucket)
    }
    return groupOrder
      .filter((label) => map.has(label))
      .map((label) => ({ label, items: map.get(label)! }))
  }, [filtered])

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <Card className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Notificações</h2>
              {unreadCount > 0 ? (
                <Badge
                  variant="outline"
                  className="border-border bg-background/40"
                >
                  {unreadCount} não lidas
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Acompanhe menções, mensagens e atualizações da sua conta.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-border bg-background/40 hover:bg-accent/50"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck />
            Marcar todas como lidas
          </Button>
        </div>

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <TabsList className="flex-wrap border border-border bg-background/40">
            {filters.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
        <ScrollArea className="min-h-0 flex-1 overflow-hidden rounded-4xl">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40 text-muted-foreground">
                <BellOff className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Nada por aqui</p>
                <p className="text-sm text-muted-foreground">
                  Você não tem notificações neste filtro.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {grouped.map((group, groupIndex) => (
                <div key={group.label} className="flex flex-col">
                  <div
                    className={cn(
                      "sticky top-0 z-10 bg-card px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase",
                      groupIndex === 0 && "rounded-t-4xl"
                    )}
                  >
                    {group.label}
                  </div>
                  <div className="flex flex-col divide-y divide-border">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
                          !item.read && "bg-accent/30"
                        )}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/40 text-foreground">
                          <item.icon className="size-4" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                            {!item.read ? (
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                            ) : null}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.description}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(item.date)}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          {!item.read ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-accent/50"
                              aria-label="Marcar como lida"
                              onClick={() => markAsRead(item.id)}
                            >
                              <Check />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            aria-label="Remover notificação"
                            onClick={() => remove(item.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}
