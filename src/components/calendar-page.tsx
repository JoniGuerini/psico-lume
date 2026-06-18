import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarPlus, ChevronLeft, ChevronRight, Clock } from "lucide-react"

import { initialPatients } from "@/components/patients-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
const DAY_MINUTES = 24 * 60
const durationOptions = [30, 45, 50, 60, 90]

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

function minutesToTime(total: number) {
  const clamped = Math.max(0, Math.min(DAY_MINUTES, total))
  const hours = Math.floor(clamped / 60)
  const minutes = Math.round(clamped % 60)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function snap(value: number, step: number) {
  return Math.round(value / step) * step
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`
}

function fromDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function eventsOfDay(list: CalendarEvent[], date: Date) {
  return list
    .filter((event) => isSameDay(event.date, date))
    .sort((a, b) => a.start.localeCompare(b.start))
}

type QuickSessionFormProps = {
  defaults: { date: Date; start: string; duration: number }
  onCreate: (event: CalendarEvent) => void
  onCancel: () => void
  onSelectOpenChange: (open: boolean) => void
}

function QuickSessionForm({
  defaults,
  onCreate,
  onCancel,
  onSelectOpenChange,
}: QuickSessionFormProps) {
  const patientNames = useMemo(
    () => initialPatients.map((patient) => patient.name),
    []
  )

  const [patient, setPatient] = useState(patientNames[0] ?? "")
  const [date, setDate] = useState(toDateInput(defaults.date))
  const [start, setStart] = useState(defaults.start)
  const [duration, setDuration] = useState(String(defaults.duration))

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!patient || !start) {
      return
    }
    const startMin = toMinutes(start)
    onCreate({
      id: crypto.randomUUID(),
      title: patient,
      date: fromDateInput(date),
      start,
      end: minutesToTime(startMin + Number(duration)),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <PopoverHeader>
        <PopoverTitle className="font-heading">Novo atendimento</PopoverTitle>
      </PopoverHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quick-patient" className="text-xs">
          Paciente
        </Label>
        <Select
          value={patient}
          onValueChange={setPatient}
          onOpenChange={onSelectOpenChange}
        >
          <SelectTrigger id="quick-patient" className="w-full">
            <SelectValue placeholder="Selecione o paciente" />
          </SelectTrigger>
          <SelectContent>
            {patientNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quick-date" className="text-xs">
          Data
        </Label>
        <Input
          id="quick-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quick-start" className="text-xs">
            Início
          </Label>
          <Input
            id="quick-start"
            type="time"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quick-duration" className="text-xs">
            Duração
          </Label>
          <Select
            value={duration}
            onValueChange={setDuration}
            onOpenChange={onSelectOpenChange}
          >
            <SelectTrigger id="quick-duration" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!patient || !start}>
          Salvar
        </Button>
      </div>
    </form>
  )
}

type DragMeta = {
  id: string
  durationMin: number
  grabOffsetMin: number
}

type DragPreview = {
  dayIndex: number
  startMin: number
  moved: boolean
}

type Draft = {
  dayIndex: number
  startMin: number
  durationMin: number
}

type TimeGridProps = {
  days: Date[]
  events: CalendarEvent[]
  onSelectDay: (date: Date) => void
  onCreate: (event: CalendarEvent) => void
  onMoveEvent: (id: string, date: Date, startMinutes: number) => void
}

function TimeGrid({
  days,
  events,
  onSelectDay,
  onCreate,
  onMoveEvent,
}: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)
  const dragMetaRef = useRef<DragMeta | null>(null)
  const suppressClickRef = useRef(false)

  const [dragId, setDragId] = useState<string | null>(null)
  const [preview, setPreview] = useState<DragPreview | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [selectOpen, setSelectOpen] = useState(false)

  useEffect(() => {
    const viewport = scrollRef.current?.closest(
      "[data-slot=scroll-area-viewport]"
    )
    if (viewport instanceof HTMLElement) {
      viewport.scrollTop = 7 * HOUR_HEIGHT
    }
  }, [])

  function pointToGrid(clientX: number, clientY: number) {
    const rect = columnsRef.current?.getBoundingClientRect()
    if (!rect) {
      return { dayIndex: 0, minutes: 0 }
    }
    const colWidth = rect.width / days.length
    let dayIndex = Math.floor((clientX - rect.left) / colWidth)
    dayIndex = Math.max(0, Math.min(days.length - 1, dayIndex))
    const minutes = (clientY - rect.top) / PX_PER_MIN
    return { dayIndex, minutes }
  }

  useEffect(() => {
    if (!dragId) {
      return
    }

    function handleMove(event: PointerEvent) {
      const meta = dragMetaRef.current
      if (!meta) {
        return
      }
      const { dayIndex, minutes } = pointToGrid(event.clientX, event.clientY)
      let startMin = snap(minutes - meta.grabOffsetMin, 15)
      startMin = Math.max(0, Math.min(DAY_MINUTES - meta.durationMin, startMin))
      setPreview({ dayIndex, startMin, moved: true })
    }

    function handleUp() {
      const meta = dragMetaRef.current
      setPreview((current) => {
        if (meta && current && current.moved) {
          suppressClickRef.current = true
          onMoveEvent(meta.id, days[current.dayIndex], current.startMin)
        }
        return null
      })
      dragMetaRef.current = null
      setDragId(null)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragId, days, onMoveEvent])

  function handleEventPointerDown(
    event: React.PointerEvent,
    calendarEvent: CalendarEvent
  ) {
    if (event.button !== 0) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const { minutes } = pointToGrid(event.clientX, event.clientY)
    const startMin = toMinutes(calendarEvent.start)
    const durationMin = Math.max(
      toMinutes(calendarEvent.end) - startMin,
      30
    )
    dragMetaRef.current = {
      id: calendarEvent.id,
      durationMin,
      grabOffsetMin: minutes - startMin,
    }
    setPreview({
      dayIndex: days.findIndex((day) => isSameDay(day, calendarEvent.date)),
      startMin,
      moved: false,
    })
    setDragId(calendarEvent.id)
  }

  function handleColumnClick(event: React.MouseEvent, dayIndex: number) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    const { minutes } = pointToGrid(event.clientX, event.clientY)
    const startMin = Math.max(
      0,
      Math.min(DAY_MINUTES - 60, snap(minutes, 30))
    )
    setDraft({ dayIndex, startMin, durationMin: 60 })
  }

  const meta = dragMetaRef.current
  const displayEvents = events.map((calendarEvent) => {
    if (dragId === calendarEvent.id && preview && meta) {
      const startMin = preview.startMin
      return {
        ...calendarEvent,
        date: days[preview.dayIndex],
        start: minutesToTime(startMin),
        end: minutesToTime(startMin + meta.durationMin),
        dragging: true,
      }
    }
    return { ...calendarEvent, dragging: false }
  })

  return (
    <Popover
      open={!!draft}
      onOpenChange={(open) => {
        if (!open) {
          setDraft(null)
        }
      }}
    >
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
        <div
          ref={scrollRef}
          className={cn("flex pr-3", dragId && "cursor-grabbing select-none")}
        >
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
            ref={columnsRef}
            className="grid flex-1"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {days.map((day, dayIndex) => (
              <div
                key={day.toISOString()}
                className="relative border-l"
                onClick={(event) => handleColumnClick(event, dayIndex)}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-border/60"
                  />
                ))}
                {displayEvents
                  .filter((calendarEvent) =>
                    isSameDay(calendarEvent.date, day)
                  )
                  .map((calendarEvent) => {
                    const top =
                      (toMinutes(calendarEvent.start) - START_HOUR * 60) *
                      PX_PER_MIN
                    const height = Math.max(
                      (toMinutes(calendarEvent.end) -
                        toMinutes(calendarEvent.start)) *
                        PX_PER_MIN,
                      22
                    )
                    return (
                      <div
                        key={calendarEvent.id}
                        style={{ top, height }}
                        onPointerDown={(event) =>
                          handleEventPointerDown(event, calendarEvent)
                        }
                        onClick={(event) => event.stopPropagation()}
                        className={cn(
                          "absolute right-1 left-1 touch-none overflow-hidden rounded-lg border border-border bg-background/40 px-2 py-1 shadow-sm transition-shadow",
                          calendarEvent.dragging
                            ? "z-20 cursor-grabbing opacity-90 ring-2 ring-primary"
                            : "cursor-grab hover:shadow-md"
                        )}
                      >
                        <p className="truncate text-xs font-medium">
                          {calendarEvent.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {calendarEvent.start} – {calendarEvent.end}
                        </p>
                      </div>
                    )
                  })}
                {draft && draft.dayIndex === dayIndex ? (
                  <PopoverAnchor asChild>
                    <div
                      style={{
                        top: draft.startMin * PX_PER_MIN,
                        height: Math.max(draft.durationMin * PX_PER_MIN, 22),
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-1 left-1 z-20 overflow-hidden rounded-lg border border-primary bg-primary/15 px-2 py-1 shadow-sm"
                    >
                      <p className="truncate text-xs font-medium">
                        (Novo atendimento)
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {minutesToTime(draft.startMin)} –{" "}
                        {minutesToTime(draft.startMin + draft.durationMin)}
                      </p>
                    </div>
                  </PopoverAnchor>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>

      <PopoverContent
        side="right"
        align="start"
        className="w-80"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          if (selectOpen) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (selectOpen) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (selectOpen) event.preventDefault()
        }}
      >
        {draft ? (
          <QuickSessionForm
            key={`${draft.dayIndex}-${draft.startMin}`}
            defaults={{
              date: days[draft.dayIndex],
              start: minutesToTime(draft.startMin),
              duration: draft.durationMin,
            }}
            onCreate={(event) => {
              onCreate(event)
              setDraft(null)
            }}
            onCancel={() => setDraft(null)}
            onSelectOpenChange={setSelectOpen}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

type NewSessionPopoverProps = {
  selectedDate: Date
  onCreate: (event: CalendarEvent) => void
  align?: "start" | "center" | "end"
  children: React.ReactNode
}

function NewSessionPopover({
  selectedDate,
  onCreate,
  align = "end",
  children,
}: NewSessionPopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          if (selectOpen) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (selectOpen) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (selectOpen) event.preventDefault()
        }}
      >
        {open ? (
          <QuickSessionForm
            defaults={{ date: selectedDate, start: "09:00", duration: 50 }}
            onCreate={(event) => {
              onCreate(event)
              setOpen(false)
            }}
            onCancel={() => setOpen(false)}
            onSelectOpenChange={setSelectOpen}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function CalendarPage() {
  const [view, setView] = useState("mes")
  const [events, setEvents] = useState<CalendarEvent[]>(() => buildEvents())
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
        events: eventsOfDay(events, date),
      }
    })
  }, [currentMonth, events])

  const selectedEvents = useMemo(
    () => eventsOfDay(events, selectedDate),
    [events, selectedDate]
  )

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

  function handleCreate(event: CalendarEvent) {
    setEvents((current) => [...current, event])
    setSelectedDate(event.date)
  }

  function handleMoveEvent(id: string, date: Date, startMinutes: number) {
    setEvents((current) =>
      current.map((event) => {
        if (event.id !== id) {
          return event
        }
        const durationMin = Math.max(
          toMinutes(event.end) - toMinutes(event.start),
          30
        )
        return {
          ...event,
          date,
          start: minutesToTime(startMinutes),
          end: minutesToTime(startMinutes + durationMin),
        }
      })
    )
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
          <NewSessionPopover
            selectedDate={selectedDate}
            onCreate={handleCreate}
            align="end"
          >
            <Button size="sm">
              <CalendarPlus />
              Novo atendimento
            </Button>
          </NewSessionPopover>
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
            <TimeGrid
              days={weekDays}
              events={events}
              onSelectDay={setSelectedDate}
              onCreate={handleCreate}
              onMoveEvent={handleMoveEvent}
            />
          ) : null}

          {view === "dia" ? (
            <TimeGrid
              days={[selectedDate]}
              events={events}
              onSelectDay={setSelectedDate}
              onCreate={handleCreate}
              onMoveEvent={handleMoveEvent}
            />
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
            <NewSessionPopover
              selectedDate={selectedDate}
              onCreate={handleCreate}
              align="center"
            >
              <Button className="w-full">
                <CalendarPlus />
                Novo atendimento
              </Button>
            </NewSessionPopover>
          </div>
        </Card>
      </div>
    </div>
  )
}
