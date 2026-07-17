import { useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import { useTranslation } from "@/context/locale-provider"
import type { CalendarEvent, Patient } from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import { notifySelectOpenChange } from "@/lib/dialog-outside-guard"
import { formFieldClass } from "@/lib/form-input-styles"
import {
  formatLocaleDate,
  getModalityLabel,
  getSessionStatusLabel,
} from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"
import { resolveSessionModality } from "@/lib/session-modality"
import { getEventStatus } from "@/lib/session-status"
import { cn } from "@/lib/utils"

type SessionEventPickerProps = {
  id: string
  value: string
  events: CalendarEvent[]
  patient: Patient
  onChange: (eventId: string) => void
  onOpenChange?: (open: boolean) => void
  emptyMessage?: string
  required?: boolean
  className?: string
  triggerClassName?: string
}

function formatSessionEventLabel(
  event: CalendarEvent,
  patient: Patient,
  locale: Locale,
  t: TranslateFn
) {
  const dateLabel = formatLocaleDate(event.date, locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const status = getSessionStatusLabel(t, getEventStatus(event))
  const modality = resolveSessionModality(event, patient)
  const modalityLabel = modality ? getModalityLabel(t, modality) : null
  return [dateLabel, `${event.start}–${event.end}`, status, modalityLabel]
    .filter(Boolean)
    .join(" · ")
}

export function SessionEventPicker({
  id,
  value,
  events,
  patient,
  onChange,
  onOpenChange,
  emptyMessage,
  required,
  className,
  triggerClassName,
}: SessionEventPickerProps) {
  const { t, locale } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const options = useMemo(
    () =>
      events.map((event) => ({
        event,
        label: formatSessionEventLabel(event, patient, locale, t),
      })),
    [events, patient, locale, t]
  )

  const selectedLabel =
    options.find((option) => option.event.id === value)?.label ?? ""

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return options
    return options.filter((option) =>
      option.label.toLocaleLowerCase().includes(normalized)
    )
  }, [options, query])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    notifySelectOpenChange(nextOpen)
    onOpenChange?.(nextOpen)
    if (!nextOpen) setQuery("")
  }

  function handleSelect(eventId: string) {
    onChange(eventId)
    handleOpenChange(false)
  }

  const hasValue = value.trim().length > 0

  if (events.length === 0 && !hasValue) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          {t("sessionNote.selectSession")}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {emptyMessage ?? t("sessionNote.noLinkableSessions")}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {t("sessionNote.selectSession")}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              "flex h-9 w-full cursor-pointer items-center justify-between gap-1.5 rounded-xl border-0 bg-muted px-3 py-2 text-sm whitespace-nowrap outline-none transition-[color,box-shadow,background-color] hover:bg-muted/80 focus-visible:ring-3 focus-visible:ring-ring/30",
              formFieldClass,
              hasValue && "border-0 bg-muted text-foreground",
              !hasValue && "text-muted-foreground/45",
              triggerClassName
            )}
          >
            <span className="truncate">
              {hasValue
                ? selectedLabel
                : t("sessionNote.placeholders.selectSession")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) gap-0 p-0"
        >
          <div className="border-b border-border p-2">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("sessionNote.searchSession")}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div
            className="flex max-h-48 flex-col gap-0.5 overflow-y-auto p-1.5"
            role="listbox"
            aria-label={t("sessionNote.selectSession")}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {t("common.noResults")}
              </p>
            ) : (
              filtered.map(({ event, label }) => {
                const selected = event.id === value
                return (
                  <button
                    key={event.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(event.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors",
                      selected
                        ? "bg-primary/12 text-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {selected ? (
                      <Check
                        className="size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
