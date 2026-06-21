import { useEffect, useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/context/locale-provider"
import { formFieldClass } from "@/lib/form-input-styles"
import { fromDateInput, toDateInput } from "@/lib/session-scheduling"
import { intlLocale, type Locale } from "@/lib/locale"
import { cn } from "@/lib/utils"

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
const MONTH_INDICES = Array.from({ length: 12 }, (_, index) => index)

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

function monthName(monthIndex: number, locale: Locale) {
  const raw = new Date(2000, monthIndex, 1).toLocaleDateString(
    intlLocale(locale),
    { month: "long" }
  )
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

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date) {
  const day = startOfDay(date).getTime()
  if (minDate && day < startOfDay(minDate).getTime()) return true
  if (maxDate && day > startOfDay(maxDate).getTime()) return true
  return false
}

function isMonthDisabled(
  monthIndex: number,
  year: number,
  minDate?: Date,
  maxDate?: Date
) {
  const monthStart = new Date(year, monthIndex, 1)
  const monthEnd = new Date(year, monthIndex + 1, 0)
  if (maxDate && monthStart > startOfDay(maxDate)) return true
  if (minDate && monthEnd < startOfDay(minDate)) return true
  return false
}

function canShiftMonth(
  viewMonth: Date,
  offset: number,
  minDate?: Date,
  maxDate?: Date
) {
  const target = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + offset,
    1
  )
  if (maxDate) {
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    if (target > maxMonth) return false
  }
  if (minDate) {
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    if (target < minMonth) return false
  }
  return true
}

function resolveYearBounds(minDate?: Date, maxDate?: Date) {
  const currentYear = new Date().getFullYear()
  const maxYear = maxDate?.getFullYear() ?? currentYear + 10
  const minYear = minDate?.getFullYear() ?? maxYear - 120
  return { minYear, maxYear }
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

  const { minYear, maxYear } = useMemo(
    () => resolveYearBounds(minDate, maxDate),
    [minDate, maxDate]
  )

  const yearOptions = useMemo(() => {
    const years: number[] = []
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year)
    }
    return years
  }, [minYear, maxYear])

  const monthGrid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

  function handleSelect(date: Date) {
    onChange(toDateInput(date))
    setOpen(false)
  }

  function shiftMonth(offset: number) {
    if (!canShiftMonth(viewMonth, offset, minDate, maxDate)) return
    setViewMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1)
    )
  }

  function setViewMonthIndex(monthIndex: number) {
    setViewMonth(
      (current) => new Date(current.getFullYear(), monthIndex, 1)
    )
  }

  function setViewYear(year: number) {
    setViewMonth((current) => new Date(year, current.getMonth(), 1))
  }

  const displayValue = formatDisplayDate(value, locale)
  const emptyFieldClass =
    "border border-foreground/22 bg-card text-foreground hover:border-foreground/35"
  const filledFieldClass = "border-2 border-foreground/55 bg-card text-foreground"
  const headerSelectTriggerClass =
    "h-8 shrink-0 rounded-2xl border border-foreground/22 bg-card px-2.5 text-sm font-medium shadow-none hover:border-foreground/35"

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-filled={displayValue ? "true" : undefined}
          className={cn(
            "h-9 w-full justify-start gap-2 rounded-3xl px-3 font-normal shadow-none",
            formFieldClass,
            displayValue ? filledFieldClass : emptyFieldClass,
            !displayValue && "text-muted-foreground/60",
            className,
            displayValue ? filledFieldClass : emptyFieldClass
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
          <div className="flex items-center justify-between gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("ui.datePicker.prevMonth")}
              disabled={!canShiftMonth(viewMonth, -1, minDate, maxDate)}
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft />
            </Button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
              <Select
                value={String(viewMonth.getMonth())}
                onValueChange={(next) => setViewMonthIndex(Number(next))}
              >
                <SelectTrigger
                  aria-label={t("ui.datePicker.selectMonth")}
                  className={cn(headerSelectTriggerClass, "w-[7.25rem]")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {MONTH_INDICES.map((monthIndex) => (
                    <SelectItem
                      key={monthIndex}
                      value={String(monthIndex)}
                      disabled={isMonthDisabled(
                        monthIndex,
                        viewMonth.getFullYear(),
                        minDate,
                        maxDate
                      )}
                    >
                      {monthName(monthIndex, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(viewMonth.getFullYear())}
                onValueChange={(next) => setViewYear(Number(next))}
              >
                <SelectTrigger
                  aria-label={t("ui.datePicker.selectYear")}
                  className={cn(headerSelectTriggerClass, "w-[5.5rem]")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("ui.datePicker.nextMonth")}
              disabled={!canShiftMonth(viewMonth, 1, minDate, maxDate)}
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
                      "border border-foreground/22 bg-background/60",
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
