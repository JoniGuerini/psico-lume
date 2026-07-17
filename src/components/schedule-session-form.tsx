import { useMemo, useState, type HTMLAttributes } from "react"
import { CalendarPlus, CheckCircle2, GripHorizontal } from "lucide-react"

import { PatientNamePicker } from "@/components/patient-name-picker"
import { SessionStatusControl } from "@/components/session-status-control"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimePicker } from "@/components/ui/time-picker"
import { useTranslation } from "@/context/locale-provider"
import type { CalendarEvent, Patient, SessionStatus } from "@/data/types"
import { parsePrice } from "@/data/patients"
import {
  formatLocaleCurrency,
  getModalityLabel,
} from "@/lib/i18n-helpers"
import {
  durationOptions,
  fromDateInput,
  minutesToTime,
  sessionFieldClass,
  toDateInput,
  toMinutes,
} from "@/lib/session-scheduling"
import {
  formatAmountInput,
  isBillableSession,
  parseAmountInput,
} from "@/lib/session-payment"
import {
  isSessionModality,
  resolveSessionModality,
  sessionModalityOptions,
  type SessionModality,
} from "@/lib/session-modality"
import { cn } from "@/lib/utils"

type LockedPatient = {
  id: string
  name: string
}

type ScheduleSessionFormProps = {
  defaults: { date: Date; start: string; duration: number }
  patientNames?: string[]
  patients?: Patient[]
  lockedPatient?: LockedPatient
  showHeader?: boolean
  /** Exibe os campos avançados do modo de edição quando o card está encaixado. */
  expanded?: boolean
  /** Handle só no topo para arrastar o popover (estilo Google Calendar). */
  dragHandleProps?: HTMLAttributes<HTMLDivElement>
  submitLabel?: string
  onSubmit: (event: CalendarEvent) => void
  onCancel: () => void
  onSelectOpenChange?: (open: boolean) => void
  idPrefix?: string
}

export function ScheduleSessionForm({
  defaults,
  patientNames = [],
  patients = [],
  lockedPatient,
  showHeader = true,
  expanded = false,
  dragHandleProps,
  submitLabel,
  onSubmit,
  onCancel,
  onSelectOpenChange,
  idPrefix = "session",
}: ScheduleSessionFormProps) {
  const { t, locale } = useTranslation()
  const resolvedSubmitLabel = submitLabel ?? t("common.save")
  const [patient, setPatient] = useState(
    lockedPatient?.name ?? patientNames[0] ?? ""
  )
  const [date, setDate] = useState(toDateInput(defaults.date))
  const [start, setStart] = useState(defaults.start)
  const [duration, setDuration] = useState(String(defaults.duration))
  const initialPatientName = lockedPatient?.name ?? patientNames[0] ?? ""
  const initialPatient =
    (lockedPatient
      ? patients.find((item) => item.id === lockedPatient.id)
      : patients.find((item) => item.name === initialPatientName)) ?? null
  const [amountInput, setAmountInput] = useState(() => {
    return initialPatient
      ? formatAmountInput(parsePrice(initialPatient.price))
      : ""
  })
  const [status, setStatus] = useState<SessionStatus>("agendada")
  const [absenceWithNotice, setAbsenceWithNotice] = useState(false)
  const [paid, setPaid] = useState(false)
  const [modality, setModality] = useState<SessionModality | "">(
    () => resolveSessionModality(
      {
        date: defaults.date,
        start: defaults.start,
        patientId: initialPatient?.id ?? "",
      },
      initialPatient
    ) ?? ""
  )

  const selectedPatient = useMemo(() => {
    if (lockedPatient) {
      return patients.find((item) => item.id === lockedPatient.id)
    }
    return patients.find((item) => item.name === patient)
  }, [lockedPatient, patient, patients])

  function handlePatientChange(name: string) {
    setPatient(name)
    const next = patients.find((item) => item.name === name)
    if (next) {
      setAmountInput(formatAmountInput(parsePrice(next.price)))
      setModality(
        resolveSessionModality(
          {
            date: fromDateInput(date),
            start,
            patientId: next.id,
          },
          next
        ) ?? ""
      )
    }
  }

  const draftEvent = useMemo<CalendarEvent>(
    () => ({
      id: "new-session",
      patientId: lockedPatient?.id ?? selectedPatient?.id ?? "",
      title: lockedPatient?.name ?? patient,
      date: fromDateInput(date),
      start,
      end: minutesToTime(toMinutes(start) + Number(duration)),
      status,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
      paid,
      amount: parseAmountInput(amountInput) || undefined,
      modality: isSessionModality(modality) ? modality : undefined,
    }),
    [
      absenceWithNotice,
      amountInput,
      date,
      duration,
      lockedPatient,
      modality,
      paid,
      patient,
      selectedPatient,
      start,
      status,
    ]
  )
  const billablePreview = useMemo(
    () => isBillableSession(draftEvent),
    [draftEvent]
  )

  function handleStatusChange(next: SessionStatus) {
    setStatus(next)
    if (!isBillableSession({ ...draftEvent, status: next })) {
      setPaid(false)
    }
  }

  function handleSelectOpenChange(open: boolean) {
    onSelectOpenChange?.(open)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const patientName = lockedPatient?.name ?? patient
    if (!patientName || !start) return

    const startMin = toMinutes(start)
    const amount = parseAmountInput(amountInput)
    const eventDate = fromDateInput(date)
    const resolvedModality = expanded && isSessionModality(modality)
      ? modality
      : resolveSessionModality(
          {
            modality: undefined,
            date: eventDate,
            start,
            patientId: lockedPatient?.id ?? selectedPatient?.id ?? "",
          },
          selectedPatient
        )

    onSubmit({
      id: crypto.randomUUID(),
      patientId: lockedPatient?.id ?? selectedPatient?.id ?? "",
      title: patientName,
      date: eventDate,
      start,
      end: minutesToTime(startMin + Number(duration)),
      status: expanded ? status : "agendada",
      amount: amount > 0 ? amount : undefined,
      modality: resolvedModality,
      absenceWithNotice:
        expanded && status === "faltou" ? absenceWithNotice : undefined,
      paid: expanded && billablePreview ? paid : undefined,
    })
  }

  const showScheduleIcon = resolvedSubmitLabel !== t("common.save")

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {dragHandleProps ? (
        <div
          {...dragHandleProps}
          role="separator"
          aria-label={t("sessionForm.dragToMove")}
          title={t("sessionForm.dragToMove")}
          className={cn(
            "flex h-8 shrink-0 cursor-grab items-center justify-center touch-none select-none",
            "border-b border-transparent bg-transparent text-muted-foreground/60",
            "transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground",
            "active:cursor-grabbing active:bg-muted active:text-foreground",
            dragHandleProps.className
          )}
        >
          <GripHorizontal className="size-4" aria-hidden />
        </div>
      ) : null}
      {showHeader ? (
        <PopoverHeader
          className={cn(
            "gap-1 border-b border-border px-4 py-3",
            dragHandleProps && "pt-1"
          )}
        >
          <PopoverTitle className="font-heading text-base">
            {t("sessionForm.newSession")}
          </PopoverTitle>
          <PopoverDescription className="text-xs">
            {t("sessionForm.newSessionHint")}
          </PopoverDescription>
        </PopoverHeader>
      ) : null}

      <div className="flex flex-col gap-4 p-4">
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          {lockedPatient ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-patient`} className="text-xs">
                {t("sessionForm.patient")}
              </Label>
              <Input
                id={`${idPrefix}-patient`}
                value={lockedPatient.name}
                readOnly
                className={sessionFieldClass}
              />
            </div>
          ) : (
            <PatientNamePicker
              id={`${idPrefix}-patient`}
              value={patient}
              names={patientNames}
              onChange={handlePatientChange}
              onOpenChange={handleSelectOpenChange}
            />
          )}

          {expanded ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-modality`} className="text-xs">
                {t("sessionForm.modality")}
              </Label>
              <Select
                value={modality || undefined}
                onValueChange={(value) =>
                  setModality(value as SessionModality)
                }
                onOpenChange={handleSelectOpenChange}
              >
                <SelectTrigger
                  id={`${idPrefix}-modality`}
                  className={cn("w-full", sessionFieldClass)}
                >
                  <SelectValue placeholder={t("patientForm.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {sessionModalityOptions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {getModalityLabel(t, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-date`} className="text-xs">
              {t("sessionForm.date")}
            </Label>
            <DatePicker
              id={`${idPrefix}-date`}
              value={date}
              onChange={setDate}
              placeholder={t("sessionForm.selectDate")}
              className={sessionFieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-start`} className="text-xs">
                {t("sessionForm.start")}
              </Label>
              <TimePicker
                id={`${idPrefix}-start`}
                value={start}
                onChange={setStart}
                placeholder={t("sessionForm.selectTime")}
                startHour={6}
                endHour={22}
                onOpenChange={handleSelectOpenChange}
                className={sessionFieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-duration`} className="text-xs">
                {t("sessionForm.duration")}
              </Label>
              <Select
                value={duration}
                onValueChange={setDuration}
                onOpenChange={handleSelectOpenChange}
              >
                <SelectTrigger
                  id={`${idPrefix}-duration`}
                  className={cn("w-full", sessionFieldClass)}
                >
                  <SelectValue placeholder={t("sessionForm.durationPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {t("sessionForm.durationMinutes", { count: option })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-amount`} className="text-xs">
              {t("sessionForm.amount")}
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id={`${idPrefix}-amount`}
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                className={cn(sessionFieldClass, "pl-9")}
                inputMode="decimal"
              />
            </div>
            {selectedPatient ? (
              <p className="text-xs text-muted-foreground">
                {t("sessionForm.patientDefault", {
                  price: formatLocaleCurrency(
                    parsePrice(selectedPatient.price),
                    locale
                  ),
                })}
              </p>
            ) : null}
          </div>
        </section>

        {expanded ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Label className="text-xs">{t("sessionForm.sessionStatus")}</Label>
            <SessionStatusControl
              value={status}
              onChange={handleStatusChange}
              compact
              className="grid-cols-3"
            />

            {status === "faltou" ? (
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <div className="min-w-0 flex flex-col gap-0.5">
                  <Label htmlFor={`${idPrefix}-notice`} className="text-xs">
                    {t("sessionForm.absenceNoticeQuestion")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("sessionForm.absenceNoticeNoCharge")}
                  </p>
                </div>
                <Switch
                  id={`${idPrefix}-notice`}
                  checked={absenceWithNotice}
                  onCheckedChange={(checked) => {
                    setAbsenceWithNotice(checked)
                    if (
                      !isBillableSession({
                        ...draftEvent,
                        absenceWithNotice: checked,
                      })
                    ) {
                      setPaid(false)
                    }
                  }}
                  className="shrink-0"
                />
              </div>
            ) : null}

            {billablePreview ? (
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <div className="min-w-0 flex flex-col gap-0.5">
                  <Label className="text-xs">{t("sessionForm.payment")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {paid ? t("sessionForm.paid") : t("sessionForm.unpaid")}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={paid ? "outline" : "default"}
                  className="shrink-0"
                  onClick={() => setPaid((current) => !current)}
                >
                  {paid ? (
                    t("sessionForm.undoPayment")
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      {t("sessionForm.markPaid")}
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:bg-accent/50"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              !(lockedPatient?.name ?? patient) ||
              !start ||
              (expanded && !isSessionModality(modality))
            }
          >
            {showScheduleIcon ? <CalendarPlus /> : null}
            {resolvedSubmitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
