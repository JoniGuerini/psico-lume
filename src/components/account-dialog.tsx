import { useEffect, useRef, useState } from "react"
import {
  Bell,
  Camera,
  Check,
  CreditCard,
  Laptop,
  LogOut,
  Palette,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { densityPresets, themePresets } from "@/lib/design-system"
import { useTheme } from "@/context/theme-provider"

type AccountDialogProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Section = {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

const sections: Section[] = [
  {
    id: "perfil",
    label: "Perfil",
    description: "Nome, e-mail e foto no workspace.",
    icon: User,
  },
  {
    id: "seguranca",
    label: "Segurança",
    description: "Senha, login e dispositivos conectados.",
    icon: ShieldCheck,
  },
  {
    id: "notificacoes",
    label: "Notificações",
    description: "Escolha o que e como ser avisado.",
    icon: Bell,
  },
  {
    id: "aparencia",
    label: "Aparência",
    description: "Personalize o visual do seu workspace.",
    icon: Palette,
  },
]

const activeSessions = [
  {
    id: "1",
    device: "MacBook Pro · Chrome",
    location: "São Paulo, BR",
    current: true,
    icon: Laptop,
  },
  {
    id: "2",
    device: "iPhone 15 · Safari",
    location: "São Paulo, BR",
    current: false,
    icon: Smartphone,
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

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl border border-border bg-background/40 p-6",
        className
      )}
      {...props}
    />
  )
}

export function AccountDialog({ user, open, onOpenChange }: AccountDialogProps) {
  const [section, setSection] = useState("perfil")

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactor, setTwoFactor] = useState(true)

  const [notifications, setNotifications] = useState({
    pendingSessionStatus: true,
    sessionReminder: true,
    pendingEvolution: true,
    overduePayment: true,
    waitingListReview: true,
    weeklySummary: false,
    productUpdates: false,
  })

  const { theme, density, setTheme, setDensity } = useTheme()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)

  useEffect(() => {
    return () => {
      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [avatarUrl])

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setAvatarUrl((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous)
      }
      return URL.createObjectURL(file)
    })

    event.target.value = ""
  }

  function setNotification(key: keyof typeof notifications, value: boolean) {
    setNotifications((current) => ({ ...current, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-h-[calc(100%-2rem)] w-[92vw] flex-col gap-0 overflow-hidden bg-sidebar p-0 text-sidebar-foreground sm:max-w-5xl md:flex-row">
        <aside className="flex shrink-0 flex-col gap-1 p-3 md:w-64 md:p-4">
          <DialogHeader className="gap-1 px-2 pt-1 pb-3 text-left sm:text-left">
            <DialogTitle className="font-heading text-xl text-sidebar-foreground">
              Conta
            </DialogTitle>
            <DialogDescription className="text-sidebar-foreground/70">
              Gerencie suas informações e preferências.
            </DialogDescription>
          </DialogHeader>
          <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {sections.map((item) => {
              const isActive = section === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors md:w-full",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-md md:ml-0">
          <ScrollArea className="h-0 min-h-0 flex-1">
            <div className="p-6">
            {section === "perfil" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title="Perfil"
                  description="Dados da sua conta — visíveis só para você no Lume."
                />

                <div className="flex flex-col gap-5 rounded-3xl bg-sidebar p-6 text-sidebar-foreground sm:flex-row sm:items-center">
                  <div className="relative shrink-0">
                    <Avatar className="size-20 rounded-2xl ring-2 ring-white/15 after:rounded-2xl">
                      <AvatarImage
                        src={avatarUrl}
                        alt={user.name}
                        className="rounded-2xl"
                      />
                      <AvatarFallback className="rounded-2xl bg-white/10 text-xl text-sidebar-foreground">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Alterar foto"
                      className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
                    >
                      <Camera className="size-4" />
                    </button>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h4 className="font-heading text-xl font-semibold text-primary-foreground">
                      {name}
                    </h4>
                    <p className="truncate text-sm text-sidebar-foreground/70">
                      {email}
                    </p>
                  </div>
                </div>

                <Panel>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="account-name">Nome completo</Label>
                      <Input
                        id="account-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="account-email">E-mail de login</Label>
                      <Input
                        id="account-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="voce@example.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border pt-5">
                    <Button variant="ghost">Cancelar</Button>
                    <Button>Salvar alterações</Button>
                  </div>
                </Panel>
              </div>
            ) : null}

            {section === "seguranca" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title="Segurança"
                  description="Mantenha sua conta protegida."
                />

                <Panel>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      Alterar senha
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Use uma senha forte e única que você não usa em outros
                      sites.
                    </p>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="current-password">Senha atual</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-password">Nova senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="confirm-password">
                          Confirmar nova senha
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-border pt-5">
                    <Button>Atualizar senha</Button>
                  </div>
                </Panel>

                <Panel className="flex-row items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h4 className="font-heading text-base font-semibold">
                      Autenticação em duas etapas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de proteção ao entrar.
                    </p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </Panel>

                <Panel className="gap-2">
                  <div className="flex flex-col gap-1 pb-2">
                    <h4 className="font-heading text-base font-semibold">
                      Dispositivos conectados
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sessões atualmente conectadas à sua conta.
                    </p>
                  </div>
                  {activeSessions.map((item, index) => (
                    <div key={item.id} className="flex flex-col">
                      {index > 0 ? <Separator /> : null}
                      <div className="flex items-center gap-3 py-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                          <item.icon className="size-4" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {item.device}
                            </span>
                            {item.current ? (
                              <Badge
                                variant="outline"
                                className="border-border bg-card text-xs"
                              >
                                Este dispositivo
                              </Badge>
                            ) : null}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.location}
                          </span>
                        </div>
                        {!item.current ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <LogOut />
                            Encerrar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </Panel>
              </div>
            ) : null}

            {section === "notificacoes" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title="Notificações"
                  description="Escolha sobre o que você quer ser avisado."
                />

                <Panel className="gap-0">
                  <div className="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground">
                    <Bell className="size-4" />
                    Clínico e agenda
                  </div>
                  <div className="divide-y divide-border">
                    <ToggleRow
                      title="Status de sessão pendente"
                      description="Quando uma sessão passou e ainda não foi marcada na agenda."
                      checked={notifications.pendingSessionStatus}
                      onCheckedChange={(value) =>
                        setNotification("pendingSessionStatus", value)
                      }
                    />
                    <ToggleRow
                      title="Lembretes do dia"
                      description="Atendimentos de hoje para você registrar após a sessão."
                      checked={notifications.sessionReminder}
                      onCheckedChange={(value) =>
                        setNotification("sessionReminder", value)
                      }
                    />
                    <ToggleRow
                      title="Evolução clínica pendente"
                      description="Sessão realizada sem registro no prontuário."
                      checked={notifications.pendingEvolution}
                      onCheckedChange={(value) =>
                        setNotification("pendingEvolution", value)
                      }
                    />
                    <ToggleRow
                      title="Lista de espera e pausas"
                      description="Pacientes que precisam de revisão no cadastro."
                      checked={notifications.waitingListReview}
                      onCheckedChange={(value) =>
                        setNotification("waitingListReview", value)
                      }
                    />
                  </div>
                </Panel>

                <Panel className="gap-0">
                  <div className="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground">
                    <CreditCard className="size-4" />
                    Financeiro e resumos
                  </div>
                  <div className="divide-y divide-border">
                    <ToggleRow
                      title="Inadimplência e conciliação"
                      description="Pagamentos em aberto e sessões ainda não refletidas no financeiro."
                      checked={notifications.overduePayment}
                      onCheckedChange={(value) =>
                        setNotification("overduePayment", value)
                      }
                    />
                    <ToggleRow
                      title="Resumo semanal"
                      description="Panorama da semana com pendências de agenda e financeiro."
                      checked={notifications.weeklySummary}
                      onCheckedChange={(value) =>
                        setNotification("weeklySummary", value)
                      }
                    />
                    <ToggleRow
                      title="Novidades do Lume"
                      description="Dicas e novidades de produto (ocasional)."
                      checked={notifications.productUpdates}
                      onCheckedChange={(value) =>
                        setNotification("productUpdates", value)
                      }
                    />
                  </div>
                </Panel>
              </div>
            ) : null}

            {section === "aparencia" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title="Aparência"
                  description="Personalize o visual do seu workspace."
                />

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      Tema do workspace
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Cores do shell, fundo e destaques em todo o app.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {themePresets.map((preset) => {
                      const isActive = theme === preset.id
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setTheme(preset.id)}
                          className={cn(
                            "flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
                            isActive
                              ? "border-primary bg-accent/50"
                              : "border-border hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-9 flex-1 rounded-lg border border-black/5"
                              style={{ backgroundColor: preset.preview.sidebar }}
                              aria-hidden
                            />
                            <span
                              className="h-9 flex-1 rounded-lg border border-black/5"
                              style={{ backgroundColor: preset.preview.background }}
                              aria-hidden
                            />
                            <span
                              className="size-9 shrink-0 rounded-full border border-black/5"
                              style={{ backgroundColor: preset.preview.accent }}
                              aria-hidden
                            />
                          </div>
                          <span className="flex w-full items-center justify-between text-sm font-medium">
                            {preset.label}
                            {isActive ? (
                              <Check className="size-4 text-primary" />
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {preset.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Panel>

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      Densidade
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Ajuste o espaçamento das listas e tabelas.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {densityPresets.map((option) => {
                      const isActive = density === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setDensity(option.id)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
                            isActive
                              ? "border-primary bg-accent/50"
                              : "border-border hover:bg-accent/50"
                          )}
                        >
                          <span className="flex w-full items-center justify-between text-sm font-medium">
                            {option.label}
                            {isActive ? (
                              <Check className="size-4 text-primary" />
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Panel>
              </div>
            ) : null}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
