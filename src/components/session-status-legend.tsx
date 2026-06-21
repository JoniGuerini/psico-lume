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
                "size-3 shrink-0 rounded-sm border shadow-sm",
                config.block
              )}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">
              {getSessionStatusLabel(t, status)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
