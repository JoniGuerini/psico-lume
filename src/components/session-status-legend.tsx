import { useTranslation } from "@/context/locale-provider"
import { getSessionStatusLabel } from "@/lib/i18n-helpers"
import {
  sessionStatusConfig,
  sessionStatusOptions,
} from "@/lib/session-status"
import { cn } from "@/lib/utils"

type SessionStatusLegendProps = {
  className?: string
  inline?: boolean
}

export function SessionStatusLegend({
  className,
  inline = false,
}: SessionStatusLegendProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5",
        !inline && "gap-x-4 gap-y-2 border-t border-border pt-3",
        className
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">
        {t("calendar.legend")}
      </span>
      {sessionStatusOptions.map((status) => {
        const config = sessionStatusConfig[status]
        return (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className={cn(
                "relative h-3.5 w-8 shrink-0 overflow-hidden rounded-sm border shadow-sm",
                config.block
              )}
              aria-hidden
            >
              {status === "cancelada" && (
                <span className="absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-[var(--session-cancelada-fg)]" />
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {getSessionStatusLabel(t, status)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
