import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react"

import { ScheduleSessionForm } from "@/components/schedule-session-form"
import { CalendarEventListItem } from "@/components/calendar-event-card"
import { EditSessionDialog } from "@/components/edit-session-dialog"
import { SessionStatusLegend } from "@/components/session-status-legend"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { eventsOfDay } from "@/data/calendar"
import { addDays, isSameDay } from "@/data/patients"
import type { CalendarEvent, Patient } from "@/data/types"
import { minutesToTime, toMinutes } from "@/lib/session-scheduling"
import { resolveEventStatus, sessionStatusConfig } from "@/lib/session-status"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const START_HOUR = 0
const HOUR_HEIGHT = 56
const PX_PER_MIN = HOUR_HEIGHT / 60
const HOURS = Array.from({ length: 24 }, (_, index) => index)
const DAY_MINUTES = 24 * 60

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

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay())
}

function snap(value: number, step: number) {
  return Math.round(value / step) * step
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type DragMeta = {
  id: string
  durationMin: number
  grabOffsetMin: number
  originDayIndex: number
  originStartMin: number
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
  patientNames: string[]
  patients: Patient[]
  onSelectDay: (date: Date) => void
  onCreate: (event: CalendarEvent) => void
  onMoveEvent: (id: string, date: Date, startMinutes: number) => void
  onSelectEvent: (event: CalendarEvent) => void
}

function TimeGrid({
  days,
  events,
  patientNames,
  patients,
  onSelectDay,
  onCreate,
  onMoveEvent,
  onSelectEvent,
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
      const moved =
        dayIndex !== meta.originDayIndex ||
        Math.abs(startMin - meta.originStartMin) >= 15
      setPreview({ dayIndex, startMin, moved })
    }

    function handleUp() {
      const meta = dragMetaRef.current
      setPreview((current) => {
        if (meta && current) {
          if (current.moved) {
            suppressClickRef.current = true
            onMoveEvent(meta.id, days[current.dayIndex], current.startMin)
          } else {
            const selected = events.find((item) => item.id === meta.id)
            if (selected) {
              onSelectEvent(selected)
            }
          }
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
  }, [dragId, days, events, onMoveEvent, onSelectEvent])

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
    const originDayIndex = days.findIndex((day) =>
      isSameDay(day, calendarEvent.date)
    )
    dragMetaRef.current = {
      id: calendarEvent.id,
      durationMin,
      grabOffsetMin: minutes - startMin,
      originDayIndex,
      originStartMin: startMin,
    }
    setPreview({
      dayIndex: originDayIndex,
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

      <ScrollArea className="h-0 min-h-0 flex-1">
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
                    const eventStatus = resolveEventStatus(calendarEvent)
                    const statusStyle = sessionStatusConfig[eventStatus].block
                    return (
                      <div
                        key={calendarEvent.id}
                        style={{ top, height }}
                        onPointerDown={(event) =>
                          handleEventPointerDown(event, calendarEvent)
                        }
                        onClick={(event) => event.stopPropagation()}
                        className={cn(
                          "absolute right-1 left-1 touch-none overflow-hidden rounded-lg border px-2 py-1 shadow-sm transition-shadow",
                          statusStyle,
                          calendarEvent.dragging
                            ? "z-20 cursor-grabbing opacity-90 ring-2 ring-primary"
                            : "cursor-pointer hover:shadow-md"
                        )}
                      >
                        <p
                          className={cn(
                            "truncate text-xs font-medium",
                            (eventStatus === "faltou" ||
                              eventStatus === "cancelada") &&
                              "text-muted-foreground line-through"
                          )}
                        >
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
        className="w-80 gap-0 overflow-hidden bg-surface-dialog p-0"
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
          <ScheduleSessionForm
            key={`${draft.dayIndex}-${draft.startMin}`}
            patientNames={patientNames}
            patients={patients}
            defaults={{
              date: days[draft.dayIndex],
              start: minutesToTime(draft.startMin),
              duration: draft.durationMin,
            }}
            onSubmit={(event) => {
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
  patientNames: string[]
  patients: Patient[]
  onCreate: (event: CalendarEvent) => void
  align?: "start" | "center" | "end"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function NewSessionPopover({
  selectedDate,
  patientNames,
  patients,
  onCreate,
  align = "end",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: NewSessionPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const open = controlledOpen ?? internalOpen

  function setOpen(next: boolean) {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(next)
    } else {
      setInternalOpen(next)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 gap-0 overflow-hidden bg-surface-dialog p-0"
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
          <ScheduleSessionForm
            patientNames={patientNames}
            patients={patients}
            defaults={{ date: selectedDate, start: "09:00", duration: 50 }}
            onSubmit={(event) => {
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

export function CalendarPage({
  initialEventId = null,
  initialView = "mes",
  openNewSession = false,
  onNewSessionOpenChange,
}: {
  initialEventId?: string | null
  initialView?: "mes" | "semana" | "dia"
  openNewSession?: boolean
  onNewSessionOpenChange?: (open: boolean) => void
} = {}) {
  const { patients, events, addEvent, moveEvent, updateEvent } = useClinicData()
  const patientNames = useMemo(
    () =>
      patients
        .filter((patient) => patient.status === "ativo")
        .map((patient) => patient.name),
    [patients]
  )
  const [view, setView] = useState(initialView)
  const [currentMonth, setCurrentMonth] = useState(
    new Date(baseYear, baseMonth, 1)
  )
  const [selectedDate, setSelectedDate] = useState(today)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)

  useEffect(() => {
    setView(initialView)
  }, [initialView])

  useEffect(() => {
    if (openNewSession) {
      setCreateSessionOpen(true)
      onNewSessionOpenChange?.(false)
    }
  }, [openNewSession, onNewSessionOpenChange])

  function handleCreateSessionOpenChange(open: boolean) {
    setCreateSessionOpen(open)
    if (!open) onNewSessionOpenChange?.(false)
  }

  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingEventId) ?? null,
    [events, editingEventId]
  )

  useEffect(() => {
    if (!initialEventId) return

    const event = events.find((item) => item.id === initialEventId)
    if (!event) return

    setSelectedDate(event.date)
    setCurrentMonth(new Date(event.date.getFullYear(), event.date.getMonth(), 1))
    setEditingEventId(event.id)
  }, [initialEventId, events])

  function handleSelectEvent(event: CalendarEvent) {
    setEditingEventId(event.id)
  }

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
    addEvent(event)
    setSelectedDate(event.date)
  }

  function handleMoveEvent(id: string, date: Date, startMinutes: number) {
    moveEvent(id, date, startMinutes)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="flex flex-row flex-wrap items-center gap-3 p-3">
        <div className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border bg-background/40 p-1">
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
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2 className="shrink-0 text-lg font-semibold">{title}</h2>
          <SessionStatusLegend inline />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Tabs
              value={view}
              onValueChange={(value) =>
                setView(value as "mes" | "semana" | "dia")
              }
            >
              <TabsList className="border border-border bg-background/40">
                <TabsTrigger value="mes">Mês</TabsTrigger>
                <TabsTrigger value="semana">Semana</TabsTrigger>
                <TabsTrigger value="dia">Dia</TabsTrigger>
              </TabsList>
            </Tabs>
            <NewSessionPopover
              selectedDate={selectedDate}
              patientNames={patientNames}
              patients={patients}
              onCreate={handleCreate}
              align="end"
              open={createSessionOpen}
              onOpenChange={handleCreateSessionOpenChange}
            >
              <Button size="sm">
                <CalendarPlus />
                Novo atendimento
              </Button>
            </NewSessionPopover>
          </div>
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
              patientNames={patientNames}
              patients={patients}
              onSelectDay={setSelectedDate}
              onCreate={handleCreate}
              onMoveEvent={handleMoveEvent}
              onSelectEvent={handleSelectEvent}
            />
          ) : null}

          {view === "dia" ? (
            <TimeGrid
              days={[selectedDate]}
              events={events}
              patientNames={patientNames}
              patients={patients}
              onSelectDay={setSelectedDate}
              onCreate={handleCreate}
              onMoveEvent={handleMoveEvent}
              onSelectEvent={handleSelectEvent}
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
          <ScrollArea className="h-0 min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-4">
              {selectedEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum evento neste dia.
                </p>
              ) : (
                selectedEvents.map((event) => (
                  <CalendarEventListItem
                    key={event.id}
                    event={event}
                    onClick={() => handleSelectEvent(event)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4">
            <NewSessionPopover
              selectedDate={selectedDate}
              patientNames={patientNames}
              patients={patients}
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

      <EditSessionDialog
        open={!!editingEvent}
        onOpenChange={(open) => {
          if (!open) setEditingEventId(null)
        }}
        event={editingEvent}
        patientNames={patientNames}
        patients={patients}
        onSave={updateEvent}
      />
    </div>
  )
}
