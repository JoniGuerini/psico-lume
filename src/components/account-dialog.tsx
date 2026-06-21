import { useEffect, useMemo, useRef, useState } from "react"
import {
  Bell,
  Camera,
  Check,
  CreditCard,
  Languages,
  Laptop,
  LogOut,
  Palette,
  ShieldCheck,
  Smartphone,
  Trash2,
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
  DialogFooter,
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
import { useTranslation } from "@/context/locale-provider"
import { LOCALE_OPTIONS } from "@/lib/locale"
import {
  toastPositionPresets,
  useToast,
} from "@/context/toast-provider"
import type { ToastPosition } from "@/lib/toast-preferences"

type AccountDialogProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  isGuest?: boolean
  onUpdateGuestProfile?: (name: string) => void
  onDeleteGuestProfile?: () => void
}

type Section = {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

const guestDeleteAccountSectionId = "excluir-conta"

const TOAST_POSITION_LABEL_KEYS: Record<
  ToastPosition,
  "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
> = {
  "top-left": "topLeft",
  "top-right": "topRight",
  "bottom-left": "bottomLeft",
  "bottom-right": "bottomRight",
}

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

export function AccountDialog({
  user,
  open,
  onOpenChange,
  isGuest = false,
  onUpdateGuestProfile,
  onDeleteGuestProfile,
}: AccountDialogProps) {
  const { t, locale, setLocale } = useTranslation()
  const [section, setSection] = useState("perfil")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

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
  const { toast, position: toastPosition, setPosition: setToastPosition } =
    useToast()

  const sections = useMemo<Section[]>(
    () => [
      {
        id: "perfil",
        label: t("account.sections.perfil.label"),
        description: t("account.sections.perfil.description"),
        icon: User,
      },
      {
        id: "seguranca",
        label: t("account.sections.seguranca.label"),
        description: t("account.sections.seguranca.description"),
        icon: ShieldCheck,
      },
      {
        id: "notificacoes",
        label: t("account.sections.notificacoes.label"),
        description: t("account.sections.notificacoes.description"),
        icon: Bell,
      },
      {
        id: "preferencias",
        label: t("account.sections.preferencias.label"),
        description: t("account.sections.preferencias.description"),
        icon: Languages,
      },
      {
        id: "aparencia",
        label: t("account.sections.aparencia.label"),
        description: t("account.sections.aparencia.description"),
        icon: Palette,
      },
    ],
    [t]
  )

  const guestDeleteAccountSection = useMemo<Section>(
    () => ({
      id: guestDeleteAccountSectionId,
      label: t("account.sections.excluirConta.label"),
      description: t("account.sections.excluirConta.description"),
      icon: Trash2,
    }),
    [t]
  )

  const visibleSections = useMemo(
    () => (isGuest ? [...sections, guestDeleteAccountSection] : sections),
    [isGuest, sections, guestDeleteAccountSection]
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)

  useEffect(() => {
    if (!open) {
      setDeleteConfirmOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setName(user.name)
    setEmail(user.email)
    setAvatarUrl(user.avatar)
  }, [open, user.name, user.email, user.avatar])

  useEffect(() => {
    if (!isGuest && section === guestDeleteAccountSectionId) {
      setSection("perfil")
    }
  }, [isGuest, section])

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

  const trimmedName = name.trim()
  const canSaveGuestProfile =
    isGuest && trimmedName.length >= 2 && trimmedName !== user.name

  function handleResetProfile() {
    setName(user.name)
    setEmail(user.email)
    setAvatarUrl(user.avatar)
  }

  function handleSaveProfile() {
    if (isGuest) {
      if (!canSaveGuestProfile) return
      onUpdateGuestProfile?.(trimmedName)
      toast(t("account.profile.saved"), {
        description: t("account.profile.savedDescription"),
      })
      return
    }
  }

  function handleToastPositionChange(position: typeof toastPosition) {
    setToastPosition(position)
    toast(t("account.toastUpdated"), {
      variant: "info",
      description: t("account.toastUpdatedDescription"),
    })
  }

  function handleConfirmDeleteGuestProfile() {
    setDeleteConfirmOpen(false)
    onOpenChange(false)
    onDeleteGuestProfile?.()
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-h-[calc(100%-2rem)] w-[92vw] flex-col gap-0 overflow-hidden bg-sidebar p-0 text-sidebar-foreground sm:max-w-5xl md:flex-row">
        <aside className="flex shrink-0 flex-col gap-1 p-3 md:w-64 md:p-4">
          <DialogHeader className="gap-1 px-2 pt-1 pb-3 text-left sm:text-left">
            <DialogTitle className="font-heading text-xl text-sidebar-foreground">
              {t("account.title")}
            </DialogTitle>
            <DialogDescription className="text-sidebar-foreground/70">
              {t("account.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {visibleSections.map((item) => {
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
                  title={t("account.profile.heading")}
                  description={t("account.profile.description")}
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
                      disabled={isGuest}
                    />
                    {!isGuest ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label={t("account.profile.changePhoto")}
                        className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
                      >
                        <Camera className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h4 className="font-heading text-xl font-semibold text-surface-navy-heading">
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
                      <Label htmlFor="account-name">
                        {t("account.profile.fullName")}
                      </Label>
                      <Input
                        id="account-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={t("account.profile.namePlaceholder")}
                        maxLength={80}
                      />
                      {isGuest ? (
                        <p className="text-xs text-muted-foreground">
                          {t("account.profile.guestNameHint")}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="account-email">
                        {t("account.profile.loginEmail")}
                      </Label>
                      <Input
                        id="account-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={t("account.profile.emailPlaceholder")}
                        readOnly={isGuest}
                        disabled={isGuest}
                        className={isGuest ? "opacity-70" : undefined}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResetProfile}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="button"
                      disabled={isGuest && !canSaveGuestProfile}
                      onClick={handleSaveProfile}
                    >
                      {t("account.profile.saveChanges")}
                    </Button>
                  </div>
                </Panel>
              </div>
            ) : null}

            {section === "excluir-conta" && isGuest ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title={t("account.deleteGuest.heading")}
                  description={t("account.deleteGuest.description")}
                />

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.deleteGuest.whatWillBeRemoved")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.deleteGuest.whatWillBeRemovedDescription", {
                        name: user.name,
                      })}
                    </p>
                  </div>
                </Panel>

                <Panel className="gap-4 border-destructive/25 bg-destructive/5">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold text-destructive">
                      {t("account.deleteGuest.dangerZone")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.deleteGuest.dangerZoneDescription")}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      <Trash2 />
                      {t("account.deleteGuest.deleteAccount")}
                    </Button>
                  </div>
                </Panel>
              </div>
            ) : null}

            {section === "seguranca" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title={t("account.security.heading")}
                  description={t("account.security.description")}
                />

                <Panel>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.security.changePassword")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.security.changePasswordDescription")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="current-password">
                        {t("account.security.currentPassword")}
                      </Label>
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
                        <Label htmlFor="new-password">
                          {t("account.security.newPassword")}
                        </Label>
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
                          {t("account.security.confirmNewPassword")}
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
                    <Button>{t("account.security.updatePassword")}</Button>
                  </div>
                </Panel>

                <Panel className="flex-row items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.security.twoFactor")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.security.twoFactorDescription")}
                    </p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </Panel>

                <Panel className="gap-2">
                  <div className="flex flex-col gap-1 pb-2">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.security.connectedDevices")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.security.connectedDevicesDescription")}
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
                                {t("account.security.currentDevice")}
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
                            {t("account.security.endSession")}
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
                  title={t("account.notifications.heading")}
                  description={t("account.notifications.description")}
                />

                <Panel className="gap-0">
                  <div className="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground">
                    <Bell className="size-4" />
                    {t("account.notifications.clinical")}
                  </div>
                  <div className="divide-y divide-border">
                    <ToggleRow
                      title={t("account.notifications.pendingSession.title")}
                      description={t(
                        "account.notifications.pendingSession.description"
                      )}
                      checked={notifications.pendingSessionStatus}
                      onCheckedChange={(value) =>
                        setNotification("pendingSessionStatus", value)
                      }
                    />
                    <ToggleRow
                      title={t("account.notifications.sessionReminder.title")}
                      description={t(
                        "account.notifications.sessionReminder.description"
                      )}
                      checked={notifications.sessionReminder}
                      onCheckedChange={(value) =>
                        setNotification("sessionReminder", value)
                      }
                    />
                    <ToggleRow
                      title={t("account.notifications.pendingEvolution.title")}
                      description={t(
                        "account.notifications.pendingEvolution.description"
                      )}
                      checked={notifications.pendingEvolution}
                      onCheckedChange={(value) =>
                        setNotification("pendingEvolution", value)
                      }
                    />
                    <ToggleRow
                      title={t("account.notifications.waitingList.title")}
                      description={t(
                        "account.notifications.waitingList.description"
                      )}
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
                    {t("account.notifications.financial")}
                  </div>
                  <div className="divide-y divide-border">
                    <ToggleRow
                      title={t("account.notifications.overduePayment.title")}
                      description={t(
                        "account.notifications.overduePayment.description"
                      )}
                      checked={notifications.overduePayment}
                      onCheckedChange={(value) =>
                        setNotification("overduePayment", value)
                      }
                    />
                    <ToggleRow
                      title={t("account.notifications.weeklySummary.title")}
                      description={t(
                        "account.notifications.weeklySummary.description"
                      )}
                      checked={notifications.weeklySummary}
                      onCheckedChange={(value) =>
                        setNotification("weeklySummary", value)
                      }
                    />
                    <ToggleRow
                      title={t("account.notifications.productUpdates.title")}
                      description={t(
                        "account.notifications.productUpdates.description"
                      )}
                      checked={notifications.productUpdates}
                      onCheckedChange={(value) =>
                        setNotification("productUpdates", value)
                      }
                    />
                  </div>
                </Panel>
              </div>
            ) : null}

            {section === "preferencias" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title={t("account.preferences.heading")}
                  description={t("account.preferences.description")}
                />

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.preferences.language.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.preferences.language.description")}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {LOCALE_OPTIONS.map((option) => {
                      const isActive = locale === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setLocale(option.id)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
                            isActive
                              ? "border-primary bg-accent/50"
                              : "border-border hover:bg-accent/50"
                          )}
                        >
                          <span className="flex w-full items-center justify-between text-sm font-medium">
                            {t(option.labelKey)}
                            {isActive ? (
                              <Check className="size-4 text-primary" />
                            ) : null}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Panel>
              </div>
            ) : null}

            {section === "aparencia" ? (
              <div className="flex flex-col gap-6">
                <SectionHeading
                  title={t("account.appearance.heading")}
                  description={t("account.appearance.description")}
                />

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.appearance.theme.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.appearance.theme.description")}
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
                            {t(`account.themes.${preset.id}.label`)}
                            {isActive ? (
                              <Check className="size-4 text-primary" />
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(`account.themes.${preset.id}.description`)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Panel>

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.appearance.density.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.appearance.density.description")}
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
                            {t(`account.density.${option.id}.label`)}
                            {isActive ? (
                              <Check className="size-4 text-primary" />
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(`account.density.${option.id}.description`)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Panel>

                <Panel className="gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-heading text-base font-semibold">
                      {t("account.appearance.toastPosition.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("account.appearance.toastPosition.description")}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {toastPositionPresets.map((preset) => {
                      const isActive = toastPosition === preset.id
                      const labelKey = TOAST_POSITION_LABEL_KEYS[preset.id]
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleToastPositionChange(preset.id)}
                          className={cn(
                            "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                            isActive
                              ? "border-primary bg-accent/50"
                              : "border-border hover:bg-accent/50"
                          )}
                        >
                          <span className="relative h-14 w-full rounded-lg border border-border bg-background/60">
                            <span
                              className={cn(
                                "absolute size-2.5 rounded-full bg-primary",
                                preset.id === "top-left" && "top-2 left-2",
                                preset.id === "top-right" && "top-2 right-2",
                                preset.id === "bottom-left" && "bottom-2 left-2",
                                preset.id === "bottom-right" && "bottom-2 right-2"
                              )}
                              aria-hidden
                            />
                          </span>
                          <span className="flex w-full items-center justify-between text-sm font-medium">
                            {t(`account.toastPositions.${labelKey}.label`)}
                            {isActive ? (
                              <Check className="size-4 text-primary" />
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(`account.toastPositions.${labelKey}.description`)}
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

    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <DialogContent className="gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {t("account.deleteGuest.confirmTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("account.deleteGuest.confirmDescription", { name: user.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDeleteGuestProfile}
          >
            <Trash2 />
            {t("account.deleteGuest.deleteAccount")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
