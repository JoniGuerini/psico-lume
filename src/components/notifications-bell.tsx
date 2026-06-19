import { useMemo, useState } from "react"
import { Bell, CheckCheck } from "lucide-react"

import {
  formatRelativeTime,
  useNotifications,
} from "@/components/notifications-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type NotificationsBellProps = {
  onViewAll: () => void
}

export function NotificationsBell({ onViewAll }: NotificationsBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("todas")

  const filtered = useMemo(
    () =>
      tab === "todas"
        ? notifications
        : notifications.filter((item) => !item.read),
    [tab, notifications]
  )

  function handleViewAll() {
    setOpen(false)
    onViewAll()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-border bg-card shadow-sm hover:bg-accent/50 aria-expanded:bg-card aria-expanded:text-foreground data-[state=open]:bg-card data-[state=open]:text-foreground"
          aria-label="Notificações"
        >
          <Bell />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notificações</span>
            {unreadCount > 0 ? (
              <Badge
                variant="outline"
                className="border-border bg-background/40"
              >
                {unreadCount} novas
              </Badge>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck />
            Marcar todas
          </Button>
        </div>
        <div className="px-3 pb-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full border border-border bg-background/40">
              <TabsTrigger value="todas" className="flex-1">
                Todas
              </TabsTrigger>
              <TabsTrigger value="nao-lidas" className="flex-1">
                Não lidas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Separator />
        <ScrollArea className="h-[22rem]">
          {filtered.length === 0 ? (
            <p className="px-3 py-12 text-center text-sm text-muted-foreground">
              {tab === "nao-lidas"
                ? "Você está em dia! Nenhuma notificação não lida."
                : "Nenhuma notificação."}
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    "flex gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/50",
                    !item.read && "bg-accent/30"
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/40 text-foreground">
                    <item.icon className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      {!item.read ? (
                        <span className="mt-1 ml-auto size-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(item.date)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full hover:bg-accent/50"
            onClick={handleViewAll}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
