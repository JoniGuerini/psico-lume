import { useMemo, useState } from "react"
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
import { cn } from "@/lib/utils"

type Email = {
  id: string
  name: string
  email: string
  subject: string
  preview: string
  body: string[]
  date: string
  time: string
  read: boolean
  labels: string[]
}

const emails: Email[] = [
  {
    id: "1",
    name: "Mariana Lopes",
    email: "mariana.lopes@example.com",
    subject: "Resumo da reunião de produto",
    preview:
      "Seguem os principais pontos que discutimos hoje sobre o roadmap do próximo trimestre.",
    body: [
      "Oi! Seguem os principais pontos que discutimos hoje sobre o roadmap do próximo trimestre.",
      "Decidimos priorizar a nova experiência de onboarding e adiar a refatoração do billing para o Q3.",
      "Pode revisar o documento e deixar seus comentários até sexta?",
      "Abraços,\nMariana",
    ],
    date: "Hoje",
    time: "09:24",
    read: false,
    labels: ["Trabalho", "Importante"],
  },
  {
    id: "2",
    name: "GitHub",
    email: "noreply@github.com",
    subject: "[acme/dashboard] PR #482 aprovado",
    preview:
      "Seu pull request 'feat: floating sidebar + dark mode' foi aprovado por 2 revisores.",
    body: [
      "Seu pull request 'feat: floating sidebar + dark mode' foi aprovado por 2 revisores.",
      "Ele já pode ser mergeado na branch main.",
    ],
    date: "Hoje",
    time: "08:02",
    read: false,
    labels: ["Dev"],
  },
  {
    id: "3",
    name: "Rafael Souza",
    email: "rafael@example.com",
    subject: "Mockups da tela de conta",
    preview:
      "Subi a nova versão no Figma com o modal de conta em tela cheia. O que achou?",
    body: [
      "Fala! Subi a nova versão no Figma com o modal de conta em tela cheia.",
      "Caprichei no espaçamento dos cards e no contraste. O que achou?",
    ],
    date: "Ontem",
    time: "18:47",
    read: true,
    labels: ["Design"],
  },
  {
    id: "4",
    name: "Financeiro Acme",
    email: "financeiro@example.com",
    subject: "Sua fatura de junho está disponível",
    preview:
      "A fatura referente ao mês de junho já pode ser visualizada no portal.",
    body: [
      "Olá, a fatura referente ao mês de junho já pode ser visualizada no portal.",
      "O vencimento é dia 28. Qualquer dúvida, estamos à disposição.",
    ],
    date: "Ontem",
    time: "11:15",
    read: true,
    labels: ["Financeiro"],
  },
  {
    id: "5",
    name: "Camila Nunes",
    email: "camila.nunes@example.com",
    subject: "Almoço de equipe na sexta?",
    preview: "Pensei em chamar o time pra um almoço na sexta pra comemorar o lançamento.",
    body: [
      "Oi pessoal! Pensei em chamar o time pra um almoço na sexta pra comemorar o lançamento.",
      "Topam? Me avisem pra eu reservar a mesa.",
    ],
    date: "2 dias",
    time: "16:30",
    read: true,
    labels: ["Social"],
  },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function InboxPage() {
  const [selectedId, setSelectedId] = useState(emails[0].id)
  const [tab, setTab] = useState("todos")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return emails.filter((email) => {
      const matchesTab = tab === "todos" || !email.read
      const matchesQuery =
        query.trim() === "" ||
        `${email.name} ${email.subject} ${email.preview}`
          .toLowerCase()
          .includes(query.toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [tab, query])

  const selected =
    emails.find((email) => email.id === selectedId) ?? emails[0]
  const unreadCount = emails.filter((email) => !email.read).length

  return (
    <div className="flex h-full min-h-0 gap-4">
      <Card className="flex min-h-0 w-full max-w-sm shrink-0 flex-col gap-0 p-0">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Inbox</h2>
              <Badge variant="secondary">{unreadCount} não lidos</Badge>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
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
              className="pl-9"
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
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
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col gap-0 p-0">
        <div className="flex items-center gap-2 p-4">
          <Button variant="ghost" size="icon" aria-label="Arquivar">
            <Archive />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Excluir">
            <Trash2 />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Favoritar">
            <Star />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Reply />
              Responder
            </Button>
            <Button variant="outline" size="sm">
              <Forward />
              Encaminhar
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Avatar className="size-10 rounded-xl after:rounded-xl">
            <AvatarFallback className="rounded-xl">
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
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-6">
            <h1 className="text-xl font-semibold tracking-tight">
              {selected.subject}
            </h1>
            <div className="flex flex-wrap gap-1">
              {selected.labels.map((label) => (
                <Badge key={label} variant="secondary">
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
