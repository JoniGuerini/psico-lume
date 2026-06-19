import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SessionStatus } from "@/data/types"
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
  const config = sessionStatusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", config.badge, className)}
    >
      {config.label}
    </Badge>
  )
}

export function SessionStatusControl({
  value,
  onChange,
  compact = false,
  className,
}: SessionStatusControlProps) {
  return (
    <div
      className={cn(
        "grid gap-1.5",
        compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
        className
      )}
    >
      {sessionStatusOptions.map((status) => {
        const config = sessionStatusConfig[status]
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
            {config.label}
          </Button>
        )
      })}
    </div>
  )
}
