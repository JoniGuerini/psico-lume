import { useMemo, useState } from "react"
import { CheckCircle2, Trash2 } from "lucide-react"

import { PatientNamePicker } from "@/components/patient-name-picker"
import { SessionStatusControl } from "@/components/session-status-control"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
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
  formatRescheduledFromLabel,
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
  getSessionAmount,
  isBillableSession,
  parseAmountInput,
} from "@/lib/session-payment"
import { getEventStatus } from "@/lib/session-status"
import {
  isSessionModality,
  resolveSessionModality,
  sessionModalityOptions,
  type SessionModality,
} from "@/lib/session-modality"
import { cn } from "@/lib/utils"

type EditSessionFormProps = {
  event: CalendarEvent
  patientNames: string[]
  patients: Patient[]
  onSubmit: (event: CalendarEvent) => void
  onCancel: () => void
  onDeleteRequest?: () => void
  onSelectOpenChange?: (open: boolean) => void
}

export function EditSessionForm({
  event,
  patientNames,
  patients,
  onSubmit,
  onCancel,
  onDeleteRequest,
  onSelectOpenChange,
}: EditSessionFormProps) {
  const { t, locale } = useTranslation()

  const lockedPatient = useMemo(() => {
    if (!event.patientId) return null
    const patient = patients.find((item) => item.id === event.patientId)
    return patient ? { id: patient.id, name: patient.name } : null
  }, [event.patientId, patients])

  const initialDuration = Math.max(
    toMinutes(event.end) - toMinutes(event.start),
    30
  )

  const [patient, setPatient] = useState(
    lockedPatient?.name ?? event.title ?? patientNames[0] ?? ""
  )
  const [date, setDate] = useState(toDateInput(event.date))
  const [start, setStart] = useState(event.start)
  const [duration, setDuration] = useState(String(initialDuration))
  const [status, setStatus] = useState<SessionStatus>(getEventStatus(event))
  const [amountInput, setAmountInput] = useState(
    formatAmountInput(getSessionAmount(event, lockedPatient ? patients.find((p) => p.id === lockedPatient.id) : undefined))
  )
  const [absenceWithNotice, setAbsenceWithNotice] = useState(
    event.absenceWithNotice ?? false
  )
  const [paid, setPaid] = useState(event.paid === true)
  const [modality, setModality] = useState<SessionModality | "">(() => {
    const patientRecord = event.patientId
      ? patients.find((item) => item.id === event.patientId)
      : undefined
    return resolveSessionModality(event, patientRecord) ?? ""
  })

  const selectedPatient = useMemo(() => {
    if (lockedPatient) {
      return patients.find((item) => item.id === lockedPatient.id)
    }
    return patients.find((item) => item.name === patient)
  }, [lockedPatient, patient, patients])

  function handlePatientChange(name: string) {
    setPatient(name)
    if (event.amount != null) return
    const next = patients.find((item) => item.name === name)
    if (next) {
      setAmountInput(formatAmountInput(parsePrice(next.price)))
    }
  }

  const draftEvent = useMemo<CalendarEvent>(
    () => ({
      ...event,
      status,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
      paid,
    }),
    [event, status, absenceWithNotice, paid]
  )

  const billablePreview = useMemo(
    () => isBillableSession(draftEvent),
    [draftEvent]
  )

  function handleStatusChange(next: SessionStatus) {
    const wasBillable = isBillableSession({
      ...event,
      status,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
    })
    const nextAbsence = next === "faltou" ? absenceWithNotice : undefined
    const nextBillable = isBillableSession({
      ...event,
      status: next,
      absenceWithNotice: nextAbsence,
    })
    setStatus(next)
    if (!nextBillable || !wasBillable) {
      setPaid(false)
    }
  }

  function handleAbsenceChange(checked: boolean) {
    const wasBillable = isBillableSession({
      ...event,
      status,
      absenceWithNotice,
    })
    const nextBillable = isBillableSession({
      ...event,
      status,
      absenceWithNotice: checked,
    })
    setAbsenceWithNotice(checked)
    if (!nextBillable || !wasBillable) {
      setPaid(false)
    }
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    const patientName = lockedPatient?.name ?? patient
    if (!patientName || !start || !isSessionModality(modality)) return

    const startMin = toMinutes(start)
    const resolvedPatientId =
      lockedPatient?.id ??
      patients.find((item) => item.name === patientName)?.id ??
      event.patientId
    const amount = parseAmountInput(amountInput)
    const nextBillable = isBillableSession({
      ...event,
      status,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
    })

    onSubmit({
      id: event.id,
      patientId: resolvedPatientId,
      title: patientName,
      date: fromDateInput(date),
      start,
      end: minutesToTime(startMin + Number(duration)),
      status,
      amount: amount > 0 ? amount : undefined,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
      paid: nextBillable ? paid : undefined,
      modality,
      rescheduledFrom:
        status === "remarcada" ? event.rescheduledFrom : undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <ScrollArea className="h-0 min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {lockedPatient ? (
                <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                  <Label htmlFor="edit-session-patient" className="text-xs">
                    {t("sessionForm.patient")}
                  </Label>
                  <Input
                    id="edit-session-patient"
                    value={lockedPatient.name}
                    readOnly
                    className={sessionFieldClass}
                  />
                </div>
              ) : (
                <PatientNamePicker
                  id="edit-session-patient"
                  value={patient}
                  names={patientNames}
                  onChange={handlePatientChange}
                  onOpenChange={onSelectOpenChange}
                  className="col-span-2 sm:col-span-1"
                />
              )}

              <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                <Label htmlFor="edit-session-modality" className="text-xs">
                  {t("sessionForm.modality")}
                </Label>
                <Select
                  value={modality || undefined}
                  onValueChange={(value) =>
                    setModality(value as SessionModality)
                  }
                  onOpenChange={onSelectOpenChange}
                >
                  <SelectTrigger
                    id="edit-session-modality"
                    className={cn("w-full", sessionFieldClass)}
                  >
                    <SelectValue
                      placeholder={t("patientForm.selectPlaceholder")}
                    />
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

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="edit-session-date" className="text-xs">
                  {t("sessionForm.date")}
                </Label>
                <DatePicker
                  id="edit-session-date"
                  value={date}
                  onChange={setDate}
                  placeholder={t("sessionForm.selectDate")}
                  className={sessionFieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-session-start" className="text-xs">
                  {t("sessionForm.start")}
                </Label>
                <TimePicker
                  id="edit-session-start"
                  value={start}
                  onChange={setStart}
                  placeholder={t("sessionForm.selectTime")}
                  startHour={6}
                  endHour={22}
                  onOpenChange={onSelectOpenChange}
                  className={sessionFieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-session-duration" className="text-xs">
                  {t("sessionForm.duration")}
                </Label>
                <Select
                  value={duration}
                  onValueChange={setDuration}
                  onOpenChange={onSelectOpenChange}
                >
                  <SelectTrigger
                    id="edit-session-duration"
                    className={cn("w-full", sessionFieldClass)}
                  >
                    <SelectValue />
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

              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="edit-session-amount" className="text-xs">
                  {t("sessionForm.amount")}
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="edit-session-amount"
                    value={amountInput}
                    onChange={(formEvent) => setAmountInput(formEvent.target.value)}
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
            </div>
          </section>

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
                  <Label htmlFor="edit-session-notice" className="text-xs">
                    {t("sessionForm.absenceNoticeQuestion")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("sessionForm.absenceNoticeNoCharge")}
                  </p>
                </div>
                <Switch
                  id="edit-session-notice"
                  checked={absenceWithNotice}
                  onCheckedChange={handleAbsenceChange}
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

          {event.rescheduledFrom ? (
            <section className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="text-xs text-muted-foreground">
                {t("sessionForm.originalSession")}
              </p>
              <p className="text-sm font-medium">
                {formatRescheduledFromLabel(event.rescheduledFrom, locale)}
              </p>
            </section>
          ) : null}
        </div>
      </ScrollArea>

      <DialogFooter className="shrink-0 !flex-row flex-wrap items-center gap-2 border-t border-border px-4 py-3 sm:justify-between sm:px-5">
        {onDeleteRequest ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mr-auto border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDeleteRequest}
          >
            <Trash2 />
            {t("sessionForm.deleteConfirm")}
          </Button>
        ) : null}
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 hover:bg-accent/50 sm:flex-none"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={
              !(lockedPatient?.name ?? patient) || !start || !isSessionModality(modality)
            }
          >
            {t("sessionForm.saveChanges")}
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
