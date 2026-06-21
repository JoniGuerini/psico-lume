import { useEffect, useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTranslation } from "@/context/locale-provider"
import { formFieldClass } from "@/lib/form-input-styles"
import { fromDateInput, toDateInput } from "@/lib/session-scheduling"
import { intlLocale, type Locale } from "@/lib/locale"
import { cn } from "@/lib/utils"

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

type DatePickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  "aria-invalid"?: boolean
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDisplayDate(iso: string, locale: Locale) {
  if (!iso) return ""
  return fromDateInput(iso).toLocaleDateString(intlLocale(locale), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function monthLabel(date: Date, locale: Locale) {
  const raw = date.toLocaleDateString(intlLocale(locale), {
    month: "long",
    year: "numeric",
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function buildMonthGrid(viewMonth: Date) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDayOffset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []

  for (let index = 0; index < firstDayOffset; index++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date
) {
  const day = startOfDay(date).getTime()
  if (minDate && day < startOfDay(minDate).getTime()) return true
  if (maxDate && day > startOfDay(maxDate).getTime()) return true
  return false
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  minDate,
  maxDate,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const { t, locale } = useTranslation()
  const [open, setOpen] = useState(false)
  const selectedDate = value ? fromDateInput(value) : null
  const [viewMonth, setViewMonth] = useState(
    () => selectedDate ?? new Date()
  )
  const resolvedPlaceholder = placeholder ?? t("ui.datePicker.selectDate")

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate)
    }
  }, [value])

  const monthGrid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

  function handleSelect(date: Date) {
    onChange(toDateInput(date))
    setOpen(false)
  }

  function shiftMonth(offset: number) {
    setViewMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1)
    )
  }

  const displayValue = formatDisplayDate(value, locale)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-9 w-full justify-start gap-2 rounded-3xl px-3 font-normal shadow-none",
            formFieldClass,
            !displayValue && "text-muted-foreground/55",
            className
          )}
        >
          <CalendarDays className="size-4 shrink-0 opacity-70" />
          <span className="truncate text-left text-sm">
            {displayValue || resolvedPlaceholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("ui.datePicker.prevMonth")}
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm font-medium">{monthLabel(viewMonth, locale)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("ui.datePicker.nextMonth")}
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_KEYS.map((key) => (
              <span
                key={key}
                className="py-1 text-[11px] font-medium text-muted-foreground"
              >
                {t(`calendar.weekdays.${key}`)}
              </span>
            ))}
            {monthGrid.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} className="size-9" />
              }

              const iso = toDateInput(date)
              const isSelected = value === iso
              const isToday =
                toDateInput(date) === toDateInput(new Date())
              const disabledDay = isDateDisabled(date, minDate, maxDate)

              return (
                <Button
                  key={iso}
                  type="button"
                  variant={isSelected ? "default" : "ghost"}
                  size="icon-sm"
                  disabled={disabledDay}
                  className={cn(
                    "size-9 rounded-xl text-sm font-normal tabular-nums",
                    !isSelected &&
                      isToday &&
                      "border border-border bg-background/60",
                    disabledDay && "opacity-30"
                  )}
                  onClick={() => handleSelect(date)}
                >
                  {date.getDate()}
                </Button>
              )
            })}
          </div>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              {t("ui.datePicker.clearDate")}
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
