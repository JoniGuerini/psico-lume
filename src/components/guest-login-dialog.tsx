import { useEffect, useRef, useState } from "react"
import { ArrowRight, Loader2, UserRound } from "lucide-react"

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
import { useTranslation } from "@/context/locale-provider"

type GuestLoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => void
}

export function GuestLoginDialog({
  open,
  onOpenChange,
  onConfirm,
}: GuestLoginDialogProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const trimmedName = name.trim()
  const canSubmit = trimmedName.length >= 2

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("")
      setLoading(false)
    }
    onOpenChange(next)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    window.setTimeout(() => {
      onConfirm(trimmedName)
      setLoading(false)
      onOpenChange(false)
    }, 350)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">{t("login.guest.title")}</DialogTitle>
          <DialogDescription>{t("login.guest.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-name">{t("login.guest.nameLabel")}</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                id="guest-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("login.guest.namePlaceholder")}
                autoComplete="name"
                maxLength={80}
                className="border-0 bg-muted pl-9 hover:bg-muted/80"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("common.back")}
            </Button>
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("login.guest.starting")}
                </>
              ) : (
                <>
                  {t("login.guest.start")}
                  <ArrowRight />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
