import { useEffect, useMemo, useState } from "react"
import { Clock3 } from "lucide-react"

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
import { formFieldClass } from "@/lib/form-input-styles"
import { cn } from "@/lib/utils"

type TimePickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minuteStep?: number
  startHour?: number
  endHour?: number
  onOpenChange?: (open: boolean) => void
}

const defaultHours = Array.from({ length: 24 }, (_, hour) => hour)

function buildMinuteOptions(step: number) {
  const options: number[] = []
  for (let minute = 0; minute < 60; minute += step) {
    options.push(minute)
  }
  return options
}

function parseTime(value: string) {
  const [hours = "9", minutes = "0"] = value.split(":")
  return {
    hour: String(Number.parseInt(hours, 10)),
    minute: String(Number.parseInt(minutes, 10)),
  }
}

function formatTimeLabel(value: string) {
  if (!value) return ""
  const { hour, minute } = parseTime(value)
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
}

function composeTime(hour: string, minute: string) {
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
}

export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "Selecionar horário",
  className,
  disabled,
  minuteStep = 1,
  startHour = 0,
  endHour = 23,
  onOpenChange,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const parsed = parseTime(value || "09:00")
  const [hour, setHour] = useState(parsed.hour)
  const [minute, setMinute] = useState(parsed.minute)

  const hours = useMemo(
    () =>
      defaultHours.filter(
        (option) => option >= startHour && option <= endHour
      ),
    [startHour, endHour]
  )
  const minutes = useMemo(
    () => buildMinuteOptions(minuteStep),
    [minuteStep]
  )

  useEffect(() => {
    const next = parseTime(value || "09:00")
    setHour(next.hour)
    setMinute(next.minute)
  }, [value])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
    if (next && !value) {
      const fallback = parseTime("09:00")
      setHour(fallback.hour)
      setMinute(fallback.minute)
    }
  }

  function applyTime(nextHour: string, nextMinute: string) {
    onChange(composeTime(nextHour, nextMinute))
  }

  const displayValue = formatTimeLabel(value)

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start gap-2 rounded-3xl px-3 font-normal shadow-none",
            formFieldClass,
            !displayValue && "text-muted-foreground/55",
            className
          )}
        >
          <Clock3 className="size-4 shrink-0 opacity-70" />
          <span className="truncate text-left text-sm tabular-nums">
            {displayValue || placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Horário</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Hora</span>
              <Select
                value={hour}
                onValueChange={(nextHour) => {
                  setHour(nextHour)
                  applyTime(nextHour, minute)
                }}
              >
                <SelectTrigger className={cn("w-full", formFieldClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {hours.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {String(option).padStart(2, "0")}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Minuto</span>
              <Select
                value={minute}
                onValueChange={(nextMinute) => {
                  setMinute(nextMinute)
                  applyTime(hour, nextMinute)
                }}
              >
                <SelectTrigger className={cn("w-full", formFieldClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {minutes.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {String(option).padStart(2, "0")} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="self-end"
            onClick={() => setOpen(false)}
          >
            Concluir
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
