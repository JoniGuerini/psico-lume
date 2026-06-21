import { Clock } from "lucide-react"

import type { CalendarEvent } from "@/data/types"
import {
  formatRescheduledFromLabel,
  resolveEventStatus,
  sessionStatusConfig,
} from "@/lib/session-status"
import { cn } from "@/lib/utils"

type CalendarEventListItemProps = {
  event: CalendarEvent
  onClick: () => void
  className?: string
}

export function CalendarEventListItem({
  event,
  onClick,
  className,
}: CalendarEventListItemProps) {
  const status = resolveEventStatus(event)
  const statusStyle = sessionStatusConfig[status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border p-3 text-left shadow-sm transition-shadow hover:shadow-md",
        statusStyle.block,
        className
      )}
    >
      <div className="min-w-0">
        <span
          className={cn(
            "truncate text-sm font-medium",
            (status === "faltou" || status === "cancelada") && "line-through"
          )}
        >
          {event.title}
        </span>
        <span
          className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            statusStyle.blockMuted
          )}
        >
          <Clock className="size-3 shrink-0" />
          {event.start} – {event.end}
        </span>
      </div>
      {event.rescheduledFrom ? (
        <span className={cn("text-xs", statusStyle.blockMuted)}>
          Original: {formatRescheduledFromLabel(event.rescheduledFrom)}
        </span>
      ) : null}
      <span className={cn("text-xs", statusStyle.blockMuted)}>
        Clique para editar
      </span>
    </button>
  )
}
