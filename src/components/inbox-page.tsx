import { useEffect, useMemo, useState } from "react"
import {
  Archive,
  Forward,
  Reply,
  Search,
  Star,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { getInitials } from "@/data/patients"
import { cn } from "@/lib/utils"
import type { InboxEmail } from "@/data/types"

export function InboxPage({
  initialEmailId = null,
}: {
  initialEmailId?: string | null
} = {}) {
  const { emails } = useClinicData()
  const [selectedId, setSelectedId] = useState(emails[0]?.id ?? "")
  const [tab, setTab] = useState("todos")
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (initialEmailId) {
      setSelectedId(initialEmailId)
      setTab("todos")
      setQuery("")
    }
  }, [initialEmailId])

  const filtered = useMemo(() => {
    return emails.filter((email: InboxEmail) => {
      const matchesTab = tab === "todos" || !email.read
      const matchesQuery =
        query.trim() === "" ||
        `${email.name} ${email.subject} ${email.preview}`
          .toLowerCase()
          .includes(query.toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [emails, tab, query])

  const unreadCount = emails.filter((email) => !email.read).length
  const selected =
    emails.find((email) => email.id === selectedId) ?? emails[0]

  if (!selected) {
    return (
      <Card className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Nenhum e-mail disponível.</p>
      </Card>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <Card className="flex min-h-0 w-full max-w-sm shrink-0 flex-col gap-0 overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Inbox</h2>
              <Badge variant="outline" className="border-border bg-background/40">
                {unreadCount} não lidos
              </Badge>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="border border-border bg-background/40">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="nao-lidos">Não lidos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar e-mails..."
              className="border-border bg-background/40 pl-9 hover:bg-accent/50"
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-0 min-h-0 flex-1">
          <div className="flex flex-col gap-2 p-3">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Nenhum e-mail encontrado.
              </p>
            ) : null}
            {filtered.map((email) => (
              <button
                key={email.id}
                type="button"
                onClick={() => setSelectedId(email.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl border p-3 text-left transition-colors",
                  email.id === selected.id
                    ? "border-border bg-accent"
                    : "border-transparent hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {!email.read ? (
                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                  ) : null}
                  <span
                    className={cn(
                      "truncate text-sm",
                      email.read ? "font-medium" : "font-semibold"
                    )}
                  >
                    {email.name}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {email.date}
                  </span>
                </div>
                <span className="truncate text-sm font-medium">
                  {email.subject}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {email.preview}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {email.labels.map((label) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="border-border bg-background/40"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden p-0">
        <div className="flex items-center gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50"
            aria-label="Arquivar"
          >
            <Archive />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50"
            aria-label="Excluir"
          >
            <Trash2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50"
            aria-label="Favoritar"
          >
            <Star />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-background/40 hover:bg-accent/50"
            >
              <Reply />
              Responder
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-background/40 hover:bg-accent/50"
            >
              <Forward />
              Encaminhar
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Avatar className="size-10 rounded-xl after:rounded-xl">
            <AvatarFallback className="rounded-xl bg-background/40 text-xs text-foreground">
              {getInitials(selected.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold">{selected.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {selected.email}
            </span>
          </div>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {selected.date} · {selected.time}
          </span>
        </div>
        <Separator />
        <ScrollArea className="h-0 min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-6">
            <h1 className="text-xl font-semibold tracking-tight">
              {selected.subject}
            </h1>
            <div className="flex flex-wrap gap-1">
              {selected.labels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="border-border bg-background/40"
                >
                  {label}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              {selected.body.map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
