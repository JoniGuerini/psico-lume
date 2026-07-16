import { useMemo, useState } from "react"
import { CalendarPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { CalendarEvent, Patient } from "@/data/types"
import { parsePrice } from "@/data/patients"
import { formatLocaleCurrency } from "@/lib/i18n-helpers"
import {
  durationOptions,
  fromDateInput,
  minutesToTime,
  sessionFieldClass,
  toDateInput,
  toMinutes,
} from "@/lib/session-scheduling"
import { formatAmountInput, parseAmountInput } from "@/lib/session-payment"
import { resolveSessionModality } from "@/lib/session-modality"
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
  const [amountInput, setAmountInput] = useState(() => {
    const initialName = lockedPatient?.name ?? patientNames[0] ?? ""
    const initial =
      (lockedPatient
        ? patients.find((item) => item.id === lockedPatient.id)
        : patients.find((item) => item.name === initialName)) ?? null
    return initial ? formatAmountInput(parsePrice(initial.price)) : ""
  })

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
    const modality = resolveSessionModality(
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
      status: "agendada",
      amount: amount > 0 ? amount : undefined,
      modality,
    })
  }

  const showScheduleIcon = resolvedSubmitLabel !== t("common.save")

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {showHeader ? (
        <PopoverHeader className="gap-1 border-b border-border px-4 py-3">
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-patient`} className="text-xs">
              {t("sessionForm.patient")}
            </Label>
            {lockedPatient ? (
              <Input
                id={`${idPrefix}-patient`}
                value={lockedPatient.name}
                readOnly
                className={sessionFieldClass}
              />
            ) : (
              <Select
                value={patient}
                onValueChange={handlePatientChange}
                onOpenChange={handleSelectOpenChange}
              >
                <SelectTrigger
                  id={`${idPrefix}-patient`}
                  className={cn("w-full", sessionFieldClass)}
                >
                  <SelectValue placeholder={t("sessionForm.selectPatient")} />
                </SelectTrigger>
                <SelectContent>
                  {patientNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

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
            disabled={!(lockedPatient?.name ?? patient) || !start}
          >
            {showScheduleIcon ? <CalendarPlus /> : null}
            {resolvedSubmitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
