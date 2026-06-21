import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/context/locale-provider"
import type { SessionStatus } from "@/data/types"
import { getSessionStatusLabel } from "@/lib/i18n-helpers"
import {
  sessionStatusConfig,
  sessionStatusOptions,
} from "@/lib/session-status"
import { cn } from "@/lib/utils"

type SessionStatusControlProps = {
  value: SessionStatus
  onChange: (status: SessionStatus) => void
  compact?: boolean
  className?: string
}

export function SessionStatusBadge({
  status,
  className,
}: {
  status: SessionStatus
  className?: string
}) {
  const { t } = useTranslation()
  const config = sessionStatusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", config.badge, className)}
    >
      {getSessionStatusLabel(t, status)}
    </Badge>
  )
}

export function SessionStatusControl({
  value,
  onChange,
  compact = false,
  className,
}: SessionStatusControlProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "grid gap-1.5",
        compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
        className
      )}
    >
      {sessionStatusOptions.map((status) => {
        const active = value === status
        return (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn(
              "h-8 px-2 text-xs",
              !active && "border-border bg-background/40 hover:bg-accent/50"
            )}
            onClick={() => onChange(status)}
          >
            {getSessionStatusLabel(t, status)}
          </Button>
        )
      })}
    </div>
  )
}
