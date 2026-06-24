import { Clock, MapPin, Video } from "lucide-react"

import type { CalendarEvent } from "@/data/types"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { getModalityLabel } from "@/lib/i18n-helpers"
import type { SessionModality } from "@/lib/session-modality"
import {
  DEMO_SESSION_STATUS_OPTIONS,
  GUEST_SESSION_STATUS_OPTIONS,
  formatRescheduledFromLabel,
  resolveEventStatus,
  sessionStatusConfig,
} from "@/lib/session-status"
import { cn } from "@/lib/utils"

type CalendarEventListItemProps = {
  event: CalendarEvent
  modality?: SessionModality
  onClick: () => void
  className?: string
}

export function CalendarEventListItem({
  event,
  modality,
  onClick,
  className,
}: CalendarEventListItemProps) {
  const { t } = useTranslation()
  const { mode } = useClinicData()
  const sessionStatusOptions =
    mode === "demo" ? DEMO_SESSION_STATUS_OPTIONS : GUEST_SESSION_STATUS_OPTIONS
  const status = resolveEventStatus(event, new Date(), sessionStatusOptions)
  const statusStyle = sessionStatusConfig[status]
  const ModalityIcon = modality === "online" ? Video : MapPin

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
        {modality ? (
          <span
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              statusStyle.blockMuted
            )}
          >
            <ModalityIcon className="size-3 shrink-0" />
            {getModalityLabel(t, modality)}
          </span>
        ) : null}
      </div>
      {event.rescheduledFrom ? (
        <span className={cn("text-xs", statusStyle.blockMuted)}>
          Original: {formatRescheduledFromLabel(event.rescheduledFrom)}
        </span>
      ) : null}
      <span className={cn("text-xs", statusStyle.blockMuted)}>
        {t("calendar.clickToEdit")}
      </span>
    </button>
  )
}
