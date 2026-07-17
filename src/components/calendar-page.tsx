import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
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
import { useTranslation } from "@/context/locale-provider"
import { useDraggableOffset, isLeftDockZone } from "@/hooks/use-draggable-offset"
import { useIsMobile } from "@/hooks/use-mobile"
import { eventsOfDay } from "@/data/calendar"
import { addDays, isSameDay } from "@/data/patients"
import type { CalendarEvent, Patient } from "@/data/types"
import { intlLocale } from "@/lib/locale"
import { minutesToTime, toMinutes } from "@/lib/session-scheduling"
import { resolveSessionModality } from "@/lib/session-modality"
import { resolveEventStatus, sessionStatusConfig, DEMO_SESSION_STATUS_OPTIONS, GUEST_SESSION_STATUS_OPTIONS, type SessionStatusOptions } from "@/lib/session-status"
import { cn } from "@/lib/utils"

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

const START_HOUR = 0
const HOUR_HEIGHT = 56
const PX_PER_MIN = HOUR_HEIGHT / 60
const HOURS = Array.from({ length: 24 }, (_, index) => index)
const DAY_MINUTES = 24 * 60

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let intervalId = 0
    const alignMs = intervalMs - (Date.now() % intervalMs)

    const timeoutId = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => setNow(new Date()), intervalMs)
    }, alignMs)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [intervalMs])

  return now
}

function CurrentTimeIndicator({ top }: { top: number }) {
  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-30"
      style={{ top }}
      aria-hidden
    >
      <div className="relative h-0">
        <span className="absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rounded-full bg-attention shadow-sm" />
        <span className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-attention" />
      </div>
    </div>
  )
}

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

/** Coluna do formulário encaixado: inset 0.5rem + card 20rem + folga 0.5rem. */
export const SESSION_FORM_DOCK_COLUMN_CLASS = "w-[21rem]"
/** Extra além da sidebar (16rem) no preview — anima a retração da main. */
export const SESSION_FORM_DOCK_PREVIEW_EXTRA_CLASS = "w-[5rem]"

const DOCK_INSET = "0.5rem"
const DOCK_CARD_WIDTH = "20rem"
const DOCK_GHOST_LEAVE_MS = 70
const DOCK_GHOST_FADE_MS = 200

const dockedPopoverStyle = {
  position: "fixed",
  left: DOCK_INSET,
  top: DOCK_INSET,
  bottom: DOCK_INSET,
  width: DOCK_CARD_WIDTH,
  maxWidth: DOCK_CARD_WIDTH,
  transform: "none",
  margin: 0,
} as const

/** Fantasma do encaixe: silhueta do card com fade suave. */
function SessionFormDockGhost({ visible }: { visible: boolean }) {
  const [rendered, setRendered] = useState(visible)

  useEffect(() => {
    if (visible) {
      setRendered(true)
      return
    }
    const id = window.setTimeout(() => setRendered(false), DOCK_GHOST_FADE_MS)
    return () => window.clearTimeout(id)
  }, [visible])

  if (!rendered || typeof document === "undefined") return null

  return createPortal(
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed z-[70] hidden rounded-3xl border-2 border-primary bg-primary/20 md:block",
        "transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{
        left: DOCK_INSET,
        top: DOCK_INSET,
        bottom: DOCK_INSET,
        width: DOCK_CARD_WIDTH,
      }}
    />,
    document.body
  )
}

type TimeGridProps = {
  days: Date[]
  events: CalendarEvent[]
  patientNames: string[]
  patients: Patient[]
  sessionStatusOptions: SessionStatusOptions
  onSelectDay: (date: Date) => void
  onCreate: (event: CalendarEvent) => boolean
  onMoveEvent: (id: string, date: Date, startMinutes: number) => void
  onSelectEvent: (event: CalendarEvent) => void
  formDocked?: boolean
  onFormDockedChange?: (docked: boolean) => void
  onDockGhostChange?: (visible: boolean) => void
  /** Incrementa para forçar realinhar o scroll ao horário atual (ex.: botão Hoje). */
  scrollToNowTick?: number
}

function TimeGrid({
  days,
  events,
  patientNames,
  patients,
  sessionStatusOptions,
  onSelectDay,
  onCreate,
  onMoveEvent,
  onSelectEvent,
  formDocked = false,
  onFormDockedChange,
  onDockGhostChange,
  scrollToNowTick = 0,
}: TimeGridProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const now = useNow()
  const scrollRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)
  const dragMetaRef = useRef<DragMeta | null>(null)
  const suppressClickRef = useRef(false)

  const [dragId, setDragId] = useState<string | null>(null)
  const [preview, setPreview] = useState<DragPreview | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [selectOpen, setSelectOpen] = useState(false)
  const [formResetKey, setFormResetKey] = useState(0)

  const resetDragOffsetRef = useRef(() => {})
  const popoverDrag = useDraggableOffset(!!draft, {
    enabled: !isMobile,
    onDragMove: ({ clientX }) => {
      if (isMobile) return
      if (formDocked) {
        // Saiu da coluna: desencaixa e volta ao flutuante seguindo o ponteiro.
        if (!isLeftDockZone(clientX)) {
          onFormDockedChange?.(false)
          onDockGhostChange?.(false)
        }
        return
      }
      onDockGhostChange?.(isLeftDockZone(clientX))
    },
    onDragEnd: ({ clientX, moved }) => {
      onDockGhostChange?.(false)
      if (!moved || isMobile) {
        if (formDocked) resetDragOffsetRef.current()
        return
      }
      if (isLeftDockZone(clientX)) {
        onFormDockedChange?.(true)
        resetDragOffsetRef.current()
      } else {
        onFormDockedChange?.(false)
      }
    },
  })
  resetDragOffsetRef.current = popoverDrag.resetOffset

  const dockedLayout = formDocked && !popoverDrag.isDragging

  function closeDraft() {
    setDraft(null)
    onDockGhostChange?.(false)
    onFormDockedChange?.(false)
  }

  const nowTop = useMemo(() => {
    const minutes = now.getHours() * 60 + now.getMinutes()
    return (minutes - START_HOUR * 60) * PX_PER_MIN
  }, [now])

  const daysKey = useMemo(
    () => days.map((day) => day.toDateString()).join("|"),
    [days]
  )

  const prevScrollToNowTickRef = useRef(scrollToNowTick)

  useEffect(() => {
    const viewport = scrollRef.current?.closest(
      "[data-slot=scroll-area-viewport]"
    )
    if (!(viewport instanceof HTMLElement)) return

    // Posiciona o horário atual ~1/3 abaixo do topo, com contexto acima e abaixo.
    const minutes = new Date().getHours() * 60 + new Date().getMinutes()
    const currentTop = (minutes - START_HOUR * 60) * PX_PER_MIN
    const offset = Math.max(0, currentTop - viewport.clientHeight / 3)

    const fromTodayButton =
      scrollToNowTick !== prevScrollToNowTickRef.current
    prevScrollToNowTickRef.current = scrollToNowTick

    // Suave só no realinhamento explícito (botão Hoje); troca de visão/dia é instantânea.
    if (fromTodayButton) {
      viewport.scrollTo({ top: offset, behavior: "smooth" })
    } else {
      viewport.scrollTop = offset
    }
  }, [daysKey, scrollToNowTick])

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
      const payload = {
        move: null as { id: string; date: Date; startMin: number } | null,
        select: null as CalendarEvent | null,
      }

      setPreview((current) => {
        if (meta && current) {
          if (current.moved) {
            suppressClickRef.current = true
            payload.move = {
              id: meta.id,
              date: days[current.dayIndex],
              startMin: current.startMin,
            }
          } else {
            payload.select = events.find((item) => item.id === meta.id) ?? null
          }
        }
        return null
      })

      if (payload.move) {
        onMoveEvent(payload.move.id, payload.move.date, payload.move.startMin)
      } else if (payload.select) {
        onSelectEvent(payload.select)
      }

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
  /* Preview do drag precisa ler o ref no render para acompanhar o ponteiro sem re-render por frame. */
  /* eslint-disable react-hooks/refs -- preview de arraste na grade da agenda */
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
  /* eslint-enable react-hooks/refs */

  return (
    <Popover
      open={!!draft}
      onOpenChange={(open) => {
        if (!open) closeDraft()
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
            const isToday = isSameDay(day, now)
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex flex-col items-center gap-0.5 py-2"
              >
                <span className="text-xs text-muted-foreground">
                  {t(`calendar.weekdays.${WEEKDAY_KEYS[day.getDay()]}`)}
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
                {isSameDay(day, now) ? (
                  <CurrentTimeIndicator top={nowTop} />
                ) : null}
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
                    const eventStatus = resolveEventStatus(
                      calendarEvent,
                      new Date(),
                      sessionStatusOptions
                    )
                    const statusStyle = sessionStatusConfig[eventStatus]
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
                          statusStyle.block,
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
                              "line-through"
                          )}
                        >
                          {calendarEvent.title}
                        </p>
                        <p
                          className={cn(
                            "truncate text-[11px]",
                            statusStyle.blockMuted
                          )}
                        >
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
        data-session-form-docked={dockedLayout ? "" : undefined}
        data-session-form-dragging={
          popoverDrag.isDragging || popoverDrag.usesFixed ? "" : undefined
        }
        style={dockedLayout ? dockedPopoverStyle : undefined}
        className={cn(
          "z-[80] w-80 gap-0 overflow-visible bg-transparent p-0 shadow-none ring-0",
          dockedLayout && "data-[state=open]:animate-none"
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          if (selectOpen || formDocked) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (selectOpen || formDocked) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (selectOpen) event.preventDefault()
        }}
      >
        {draft ? (
          <div
            data-session-form-panel=""
            data-session-form-dragging={
              popoverDrag.isDragging || popoverDrag.usesFixed ? "" : undefined
            }
            style={dockedLayout ? undefined : popoverDrag.style}
            className={cn(
              "overflow-hidden rounded-3xl bg-surface-dialog shadow-lg ring-1 ring-foreground/5",
              dockedLayout && "flex h-full flex-col"
            )}
          >
            <div
              className={cn(dockedLayout && "min-h-0 flex-1 overflow-y-auto")}
            >
              <ScheduleSessionForm
                key={`${draft.dayIndex}-${draft.startMin}-${formResetKey}`}
                patientNames={patientNames}
                patients={patients}
                expanded={formDocked}
                defaults={{
                  date: days[draft.dayIndex],
                  start: minutesToTime(draft.startMin),
                  duration: draft.durationMin,
                }}
                dragHandleProps={
                  isMobile ? undefined : popoverDrag.handleProps
                }
                onSubmit={(event) => {
                  if (!onCreate(event)) return false
                  if (formDocked) {
                    // Encaixado: mantém o card para criar sessões em série.
                    setFormResetKey((current) => current + 1)
                  } else {
                    closeDraft()
                  }
                }}
                onCancel={closeDraft}
                onSelectOpenChange={setSelectOpen}
              />
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

type NewSessionPopoverProps = {
  selectedDate: Date
  patientNames: string[]
  patients: Patient[]
  onCreate: (event: CalendarEvent) => boolean
  align?: "start" | "center" | "end"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  formDocked?: boolean
  onFormDockedChange?: (docked: boolean) => void
  onDockGhostChange?: (visible: boolean) => void
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
  formDocked = false,
  onFormDockedChange,
  onDockGhostChange,
  children,
}: NewSessionPopoverProps) {
  const isMobile = useIsMobile()
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [formResetKey, setFormResetKey] = useState(0)
  const open = controlledOpen ?? internalOpen

  function setOpen(next: boolean) {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(next)
    } else {
      setInternalOpen(next)
    }
    if (!next) {
      onDockGhostChange?.(false)
      onFormDockedChange?.(false)
    }
  }

  const resetDragOffsetRef = useRef(() => {})
  const popoverDrag = useDraggableOffset(open, {
    enabled: !isMobile,
    onDragMove: ({ clientX }) => {
      if (isMobile) return
      if (formDocked) {
        if (!isLeftDockZone(clientX)) {
          onFormDockedChange?.(false)
          onDockGhostChange?.(false)
        }
        return
      }
      onDockGhostChange?.(isLeftDockZone(clientX))
    },
    onDragEnd: ({ clientX, moved }) => {
      onDockGhostChange?.(false)
      if (!moved || isMobile) {
        if (formDocked) resetDragOffsetRef.current()
        return
      }
      if (isLeftDockZone(clientX)) {
        onFormDockedChange?.(true)
        resetDragOffsetRef.current()
      } else {
        onFormDockedChange?.(false)
      }
    },
  })
  resetDragOffsetRef.current = popoverDrag.resetOffset

  const dockedLayout = formDocked && !popoverDrag.isDragging

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        data-session-form-docked={dockedLayout ? "" : undefined}
        data-session-form-dragging={
          popoverDrag.isDragging || popoverDrag.usesFixed ? "" : undefined
        }
        style={dockedLayout ? dockedPopoverStyle : undefined}
        className={cn(
          "z-[80] w-80 gap-0 overflow-visible bg-transparent p-0 shadow-none ring-0",
          dockedLayout && "data-[state=open]:animate-none"
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          if (selectOpen || formDocked) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (selectOpen || formDocked) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (selectOpen) event.preventDefault()
        }}
      >
        {open ? (
          <div
            data-session-form-panel=""
            data-session-form-dragging={
              popoverDrag.isDragging || popoverDrag.usesFixed ? "" : undefined
            }
            style={dockedLayout ? undefined : popoverDrag.style}
            className={cn(
              "overflow-hidden rounded-3xl bg-surface-dialog shadow-lg ring-1 ring-foreground/5",
              dockedLayout && "flex h-full flex-col"
            )}
          >
            <div
              className={cn(dockedLayout && "min-h-0 flex-1 overflow-y-auto")}
            >
              <ScheduleSessionForm
                key={formResetKey}
                patientNames={patientNames}
                patients={patients}
                expanded={formDocked}
                defaults={{ date: selectedDate, start: "09:00", duration: 50 }}
                dragHandleProps={
                  isMobile ? undefined : popoverDrag.handleProps
                }
                onSubmit={(event) => {
                  if (!onCreate(event)) return false
                  if (formDocked) {
                    // Encaixado: mantém o card para criar sessões em série.
                    setFormResetKey((current) => current + 1)
                  } else {
                    setOpen(false)
                  }
                }}
                onCancel={() => setOpen(false)}
                onSelectOpenChange={setSelectOpen}
              />
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function CalendarPage({
  initialSelectedDateTimestamp = null,
  initialView = "semana",
  openNewSession = false,
  onNewSessionOpenChange,
  onSessionFormDockedChange,
  onSessionFormDockPreviewChange,
}: {
  initialSelectedDateTimestamp?: number | null
  initialView?: "mes" | "semana" | "dia"
  openNewSession?: boolean
  onNewSessionOpenChange?: (open: boolean) => void
  onSessionFormDockedChange?: (docked: boolean) => void
  onSessionFormDockPreviewChange?: (preview: boolean) => void
} = {}) {
  const { t, locale } = useTranslation()
  const intl = intlLocale(locale)
  const { patients, events, mode, addEvent, moveEvent, updateEvent, deleteEvent } =
    useClinicData()
  const sessionStatusOptions = useMemo<SessionStatusOptions>(
    () =>
      mode === "demo" ? DEMO_SESSION_STATUS_OPTIONS : GUEST_SESSION_STATUS_OPTIONS,
    [mode]
  )
  const patientNames = useMemo(
    () =>
      patients
        .filter((patient) => patient.status === "ativo")
        .map((patient) => patient.name),
    [patients]
  )
  const [view, setView] = useState(initialView)
  const [formDocked, setFormDocked] = useState(false)
  const [dockGhostVisible, setDockGhostVisible] = useState(false)
  const [scrollToNowTick, setScrollToNowTick] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialSelectedDateTimestamp != null) {
      const date = new Date(initialSelectedDateTimestamp)
      return new Date(date.getFullYear(), date.getMonth(), 1)
    }
    return new Date(baseYear, baseMonth, 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialSelectedDateTimestamp != null) {
      return new Date(initialSelectedDateTimestamp)
    }
    return today
  })
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  const sessionDialogOpen = createSessionOpen || openNewSession

  useEffect(() => {
    onSessionFormDockedChange?.(formDocked)
    return () => onSessionFormDockedChange?.(false)
  }, [formDocked, onSessionFormDockedChange])

  useEffect(() => {
    onSessionFormDockPreviewChange?.(dockGhostVisible && !formDocked)
    return () => onSessionFormDockPreviewChange?.(false)
  }, [dockGhostVisible, formDocked, onSessionFormDockPreviewChange])

  const dockGhostLeaveTimerRef = useRef(0)

  useEffect(() => {
    return () => window.clearTimeout(dockGhostLeaveTimerRef.current)
  }, [])

  function handleFormDockedChange(docked: boolean) {
    window.clearTimeout(dockGhostLeaveTimerRef.current)
    setFormDocked(docked)
    if (docked) setDockGhostVisible(false)
  }

  function handleDockGhostChange(visible: boolean) {
    if (formDocked) {
      window.clearTimeout(dockGhostLeaveTimerRef.current)
      setDockGhostVisible(false)
      return
    }
    window.clearTimeout(dockGhostLeaveTimerRef.current)
    if (visible) {
      setDockGhostVisible(true)
      return
    }
    // Pequena histerese ao sair da zona evita flicker na borda.
    dockGhostLeaveTimerRef.current = window.setTimeout(() => {
      setDockGhostVisible(false)
    }, DOCK_GHOST_LEAVE_MS)
  }

  function handleCreateSessionOpenChange(open: boolean) {
    setCreateSessionOpen(open)
    if (!open) {
      onNewSessionOpenChange?.(false)
      window.clearTimeout(dockGhostLeaveTimerRef.current)
      setFormDocked(false)
      setDockGhostVisible(false)
    }
  }

  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingEventId) ?? null,
    [events, editingEventId]
  )

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
        currentMonth.toLocaleDateString(intl, {
          month: "long",
          year: "numeric",
        })
      )
    }
    if (view === "semana") {
      const start = weekDays[0]
      const end = weekDays[6]
      const startLabel = start.toLocaleDateString(intl, {
        day: "2-digit",
        month: "short",
      })
      const endLabel = end.toLocaleDateString(intl, {
        day: "2-digit",
        month: "short",
      })
      return `${startLabel} – ${endLabel}`
    }
    return capitalize(
      selectedDate.toLocaleDateString(intl, {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    )
  }, [view, currentMonth, weekDays, selectedDate, intl])

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
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(now)
    // Realinha a grade ao horário atual mesmo se já estiver em "hoje".
    setScrollToNowTick((tick) => tick + 1)
  }

  function handleCreate(event: CalendarEvent): boolean {
    const duplicate = events.some(
      (existing) =>
        existing.start === event.start &&
        isSameDay(existing.date, event.date) &&
        (existing.patientId
          ? existing.patientId === event.patientId
          : existing.title === event.title)
    )
    if (duplicate) return false
    addEvent(event)
    setSelectedDate(event.date)
    return true
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
            aria-label={t("calendar.previous")}
            onClick={() => navigate(-1)}
            className="size-7 rounded-full hover:bg-accent/50"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("calendar.next")}
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
            {t("calendar.today")}
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
                <TabsTrigger value="mes">{t("calendar.views.month")}</TabsTrigger>
                <TabsTrigger value="semana">{t("calendar.views.week")}</TabsTrigger>
                <TabsTrigger value="dia">{t("calendar.views.day")}</TabsTrigger>
              </TabsList>
            </Tabs>
            <NewSessionPopover
              selectedDate={selectedDate}
              patientNames={patientNames}
              patients={patients}
              onCreate={handleCreate}
              align="end"
              open={sessionDialogOpen}
              onOpenChange={handleCreateSessionOpenChange}
              formDocked={formDocked}
              onFormDockedChange={handleFormDockedChange}
              onDockGhostChange={handleDockGhostChange}
            >
              <Button size="sm">
                <CalendarPlus />
                {t("calendar.newSession")}
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
                {WEEKDAY_KEYS.map((weekdayKey) => (
                  <div
                    key={weekdayKey}
                    className="pb-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {t(`calendar.weekdays.${weekdayKey}`)}
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
                            {t(
                              day.events.length === 1
                                ? "calendar.sessionSingular"
                                : "calendar.sessionPlural"
                            )}
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
              sessionStatusOptions={sessionStatusOptions}
              onSelectDay={setSelectedDate}
              onCreate={handleCreate}
              onMoveEvent={handleMoveEvent}
              onSelectEvent={handleSelectEvent}
              formDocked={formDocked}
              onFormDockedChange={handleFormDockedChange}
              onDockGhostChange={handleDockGhostChange}
              scrollToNowTick={scrollToNowTick}
            />
          ) : null}

          {view === "dia" ? (
            <TimeGrid
              days={[selectedDate]}
              events={events}
              patientNames={patientNames}
              patients={patients}
              sessionStatusOptions={sessionStatusOptions}
              onSelectDay={setSelectedDate}
              onCreate={handleCreate}
              onMoveEvent={handleMoveEvent}
              onSelectEvent={handleSelectEvent}
              formDocked={formDocked}
              onFormDockedChange={handleFormDockedChange}
              onDockGhostChange={handleDockGhostChange}
              scrollToNowTick={scrollToNowTick}
            />
          ) : null}
        </Card>

        <Card className="flex min-h-0 w-full max-w-xs shrink-0 flex-col gap-0 p-0">
          <div className="flex flex-col gap-1 p-4">
            <span className="text-xs font-medium text-muted-foreground">
              {capitalize(
                selectedDate.toLocaleDateString(intl, { weekday: "long" })
              )}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-semibold tracking-tight">
                {selectedDate.getDate()}
              </span>
              <span className="text-sm text-muted-foreground">
                {capitalize(
                  selectedDate.toLocaleDateString(intl, { month: "long" })
                )}
              </span>
              <Badge
                variant="outline"
                className="ml-auto border-border bg-background/40"
              >
                {t(
                  selectedEvents.length === 1
                    ? "calendar.events_one"
                    : "calendar.events_other",
                  { count: selectedEvents.length }
                )}
              </Badge>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-0 min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-4">
              {selectedEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("calendar.noEventsDay")}
                </p>
              ) : (
                selectedEvents.map((event) => (
                  <CalendarEventListItem
                    key={event.id}
                    event={event}
                    modality={resolveSessionModality(
                      event,
                      patients.find((item) => item.id === event.patientId)
                    )}
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
              formDocked={formDocked}
              onFormDockedChange={handleFormDockedChange}
              onDockGhostChange={handleDockGhostChange}
            >
              <Button className="w-full">
                <CalendarPlus />
                Novo atendimento
              </Button>
            </NewSessionPopover>
          </div>
        </Card>
      </div>

      <SessionFormDockGhost visible={dockGhostVisible && !formDocked} />

      <EditSessionDialog
        open={!!editingEvent}
        onOpenChange={(open) => {
          if (!open) setEditingEventId(null)
        }}
        event={editingEvent}
        patientNames={patientNames}
        patients={patients}
        onSave={updateEvent}
        onDelete={deleteEvent}
      />
    </div>
  )
}
