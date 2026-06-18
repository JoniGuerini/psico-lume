import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarPlus, ChevronLeft, ChevronRight, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type CalendarEvent = {
  id: string
  title: string
  date: Date
  start: string
  end: string
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const START_HOUR = 0
const HOUR_HEIGHT = 56
const PX_PER_MIN = HOUR_HEIGHT / 60
const HOURS = Array.from({ length: 24 }, (_, index) => index)

function formatHour(hour: number) {
  if (hour === 0) {
    return "GMT-03"
  }
  const period = hour < 12 ? "AM" : "PM"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display} ${period}`
}

const today = new Date()
const baseYear = today.getFullYear()
const baseMonth = today.getMonth()

function atDay(day: number) {
  return new Date(baseYear, baseMonth, day)
}

const sessionPatients = [
  "Mariana Lopes",
  "Rafael Souza",
  "Camila Nunes",
  "Thiago Martins",
  "Ana Beatriz",
  "Pedro Henrique",
  "Juliana Castro",
  "Gustavo Pereira",
  "Beatriz Ramos",
  "Otávio Ribeiro",
]

const slotTimes = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
]

function buildEvents(): CalendarEvent[] {
  const plan = [
    { offset: -2, count: 4 },
    { offset: -1, count: 6 },
    { offset: 0, count: 7 },
    { offset: 1, count: 5 },
    { offset: 2, count: 8 },
    { offset: 3, count: 3 },
    { offset: 5, count: 6 },
    { offset: 7, count: 5 },
    { offset: 9, count: 4 },
  ]

  const list: CalendarEvent[] = []
  let id = 1

  for (const { offset, count } of plan) {
    const date = atDay(today.getDate() + offset)
    for (let i = 0; i < count; i++) {
      const name = sessionPatients[(id + i) % sessionPatients.length]
      const start = slotTimes[i % slotTimes.length]
      const hour = start.split(":")[0]
      list.push({
        id: String(id++),
        title: name,
        date,
        start,
        end: `${hour}:50`,
      })
    }
  }

  return list
}

const events: CalendarEvent[] = buildEvents()

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay())
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function eventsOfDay(date: Date) {
  return events
    .filter((event) => isSameDay(event.date, date))
    .sort((a, b) => a.start.localeCompare(b.start))
}

type TimeGridProps = {
  days: Date[]
  onSelectDay: (date: Date) => void
}

function TimeGrid({ days, onSelectDay }: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = scrollRef.current?.closest(
      "[data-slot=scroll-area-viewport]"
    )
    if (viewport instanceof HTMLElement) {
      viewport.scrollTop = 7 * HOUR_HEIGHT
    }
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex border-b pr-3">
        <div className="w-16 shrink-0" />
        <div
          className="grid flex-1"
          style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
        >
          {days.map((day) => {
            const isToday = isSameDay(day, today)
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex flex-col items-center gap-0.5 py-2"
              >
                <span className="text-xs text-muted-foreground">
                  {WEEKDAYS[day.getDay()]}
                </span>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full font-heading text-sm",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "font-medium"
                  )}
                >
                  {day.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div ref={scrollRef} className="flex pr-3">
          <div className="w-16 shrink-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="relative"
              >
                <span
                  className={cn(
                    "absolute right-2 text-[11px] text-muted-foreground",
                    hour === 0 ? "top-0.5" : "-top-2"
                  )}
                >
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>
          <div
            className="grid flex-1"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {days.map((day) => (
              <div key={day.toISOString()} className="relative border-l">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-border/60"
                  />
                ))}
                {eventsOfDay(day).map((event) => {
                  const top =
                    (toMinutes(event.start) - START_HOUR * 60) * PX_PER_MIN
                  const height = Math.max(
                    (toMinutes(event.end) - toMinutes(event.start)) *
                      PX_PER_MIN,
                    22
                  )
                  return (
                    <div
                      key={event.id}
                      style={{ top, height }}
                      className="absolute right-1 left-1 overflow-hidden rounded-lg border border-border bg-background/40 px-2 py-1 shadow-sm"
                    >
                      <p className="truncate text-xs font-medium">
                        {event.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {event.start} – {event.end}
                      </p>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export function CalendarPage() {
  const [view, setView] = useState("mes")
  const [currentMonth, setCurrentMonth] = useState(
    new Date(baseYear, baseMonth, 1)
  )
  const [selectedDate, setSelectedDate] = useState(today)

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [selectedDate])

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index)
      return {
        date,
        inMonth: date.getMonth() === month,
        isToday: isSameDay(date, today),
        events: eventsOfDay(date),
      }
    })
  }, [currentMonth])

  const selectedEvents = useMemo(() => eventsOfDay(selectedDate), [selectedDate])

  const title = useMemo(() => {
    if (view === "mes") {
      return capitalize(
        currentMonth.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      )
    }
    if (view === "semana") {
      const start = weekDays[0]
      const end = weekDays[6]
      const startLabel = start.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
      const endLabel = end.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
      return `${startLabel} – ${endLabel}`
    }
    return capitalize(
      selectedDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    )
  }, [view, currentMonth, weekDays, selectedDate])

  function navigate(delta: number) {
    if (view === "mes") {
      setCurrentMonth(
        (current) =>
          new Date(current.getFullYear(), current.getMonth() + delta, 1)
      )
      return
    }
    setSelectedDate((current) =>
      addDays(current, view === "semana" ? delta * 7 : delta)
    )
  }

  function goToToday() {
    setCurrentMonth(new Date(baseYear, baseMonth, 1))
    setSelectedDate(today)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card className="flex flex-row flex-wrap items-center gap-3 p-3">
        <div className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-background/40 p-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Anterior"
            onClick={() => navigate(-1)}
            className="size-7 rounded-full hover:bg-accent/50"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Próximo"
            onClick={() => navigate(1)}
            className="size-7 rounded-full hover:bg-accent/50"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="h-7 rounded-full hover:bg-accent/50"
          >
            Hoje
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="ml-auto flex items-center gap-2">
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="border border-border bg-background/40">
                <TabsTrigger value="mes">Mês</TabsTrigger>
                <TabsTrigger value="semana">Semana</TabsTrigger>
                <TabsTrigger value="dia">Dia</TabsTrigger>
              </TabsList>
            </Tabs>
          <Button size="sm">
            <CalendarPlus />
            Novo atendimento
          </Button>
        </div>
      </Card>

      <div className="flex min-h-0 flex-1 gap-4">
        <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
          {view === "mes" ? (
          <div className="flex min-h-0 flex-1 flex-col p-3">
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className="pb-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {weekday}
                </div>
              ))}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
              {monthDays.map((day) => {
                const isSelected = isSameDay(day.date, selectedDate)
                return (
                  <button
                    key={day.date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "flex min-h-0 flex-col gap-1 overflow-hidden rounded-xl border border-border p-1.5 text-left transition-colors",
                      isSelected || day.isToday
                        ? "border-primary bg-accent"
                        : "hover:bg-accent/50",
                      !day.inMonth && "bg-background/40 text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center self-start rounded-full font-heading text-sm",
                        day.isToday
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "font-medium"
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {day.events.length > 0 ? (
                      <div className="mt-auto flex w-fit items-center gap-1.5 rounded-lg border border-border bg-background/40 px-2 py-1">
                        <span className="font-heading text-sm font-semibold leading-none">
                          {day.events.length}
                        </span>
                        <span className="text-[10px] leading-none text-muted-foreground">
                          {day.events.length === 1 ? "sessão" : "sessões"}
                        </span>
                      </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {view === "semana" ? (
          <TimeGrid days={weekDays} onSelectDay={setSelectedDate} />
        ) : null}

        {view === "dia" ? (
          <TimeGrid days={[selectedDate]} onSelectDay={setSelectedDate} />
        ) : null}
      </Card>

      <Card className="flex min-h-0 w-full max-w-xs shrink-0 flex-col gap-0 p-0">
        <div className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium text-muted-foreground">
            {capitalize(
              selectedDate.toLocaleDateString("pt-BR", { weekday: "long" })
            )}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-semibold tracking-tight">
              {selectedDate.getDate()}
            </span>
            <span className="text-sm text-muted-foreground">
              {capitalize(
                selectedDate.toLocaleDateString("pt-BR", { month: "long" })
              )}
            </span>
            <Badge
              variant="outline"
              className="ml-auto border-border bg-background/40"
            >
              {selectedEvents.length}{" "}
              {selectedEvents.length === 1 ? "evento" : "eventos"}
            </Badge>
          </div>
        </div>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-3 p-4">
            {selectedEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum evento neste dia.
              </p>
            ) : (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-background/40 p-3"
                >
                  <span className="truncate text-sm font-medium">
                    {event.title}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {event.start} – {event.end}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <Button className="w-full">
            <CalendarPlus />
            Novo atendimento
          </Button>
        </div>
      </Card>
      </div>
    </div>
  )
}
