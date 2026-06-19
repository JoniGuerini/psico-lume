import { useEffect, useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { SessionStatusControl } from "@/components/session-status-control"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CalendarEvent, Patient, SessionStatus } from "@/data/types"
import { parsePrice } from "@/data/patients"
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
  isSessionPaid,
  parseAmountInput,
} from "@/lib/session-payment"
import { getEventStatus, formatRescheduledFromLabel } from "@/lib/session-status"
import { cn } from "@/lib/utils"

type EditSessionFormProps = {
  event: CalendarEvent
  patientNames: string[]
  patients: Patient[]
  onSubmit: (event: CalendarEvent) => void
  onCancel: () => void
  onMarkPaid?: (id: string, paid: boolean) => void
  onSelectOpenChange?: (open: boolean) => void
}

export function EditSessionForm({
  event,
  patientNames,
  patients,
  onSubmit,
  onCancel,
  onMarkPaid,
  onSelectOpenChange,
}: EditSessionFormProps) {
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

  const selectedPatient = useMemo(() => {
    if (lockedPatient) {
      return patients.find((item) => item.id === lockedPatient.id)
    }
    return patients.find((item) => item.name === patient)
  }, [lockedPatient, patient, patients])

  useEffect(() => {
    setPatient(lockedPatient?.name ?? event.title ?? patientNames[0] ?? "")
    setDate(toDateInput(event.date))
    setStart(event.start)
    setDuration(String(Math.max(toMinutes(event.end) - toMinutes(event.start), 30)))
    setStatus(getEventStatus(event))
    const patientRecord = lockedPatient
      ? patients.find((item) => item.id === lockedPatient.id)
      : undefined
    setAmountInput(formatAmountInput(getSessionAmount(event, patientRecord)))
    setAbsenceWithNotice(event.absenceWithNotice ?? false)
  }, [event, lockedPatient, patientNames, patients])

  useEffect(() => {
    if (selectedPatient && event.amount == null) {
      setAmountInput(formatAmountInput(parsePrice(selectedPatient.price)))
    }
  }, [selectedPatient, event.amount])

  const billablePreview = useMemo(() => {
    const preview: CalendarEvent = {
      ...event,
      status,
      absenceWithNotice: status === "faltou" ? absenceWithNotice : undefined,
    }
    return isBillableSession(preview)
  }, [event, status, absenceWithNotice])

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    const patientName = lockedPatient?.name ?? patient
    if (!patientName || !start) return

    const startMin = toMinutes(start)
    const resolvedPatientId =
      lockedPatient?.id ??
      patients.find((item) => item.name === patientName)?.id ??
      event.patientId
    const amount = parseAmountInput(amountInput)

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
      paid: event.paid,
      rescheduledFrom:
        status === "remarcada" ? event.rescheduledFrom : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col gap-4 p-4">
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-session-patient" className="text-xs">
              Paciente
            </Label>
            {lockedPatient ? (
              <Input
                id="edit-session-patient"
                value={lockedPatient.name}
                readOnly
                className={cn(sessionFieldClass, "bg-background/60")}
              />
            ) : (
              <Select
                value={patient}
                onValueChange={setPatient}
                onOpenChange={onSelectOpenChange}
              >
                <SelectTrigger
                  id="edit-session-patient"
                  className={cn("w-full", sessionFieldClass)}
                >
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
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-session-date" className="text-xs">
              Data
            </Label>
            <Input
              id="edit-session-date"
              type="date"
              value={date}
              onChange={(formEvent) => setDate(formEvent.target.value)}
              className={sessionFieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-session-start" className="text-xs">
                Início
              </Label>
              <Input
                id="edit-session-start"
                type="time"
                value={start}
                onChange={(formEvent) => setStart(formEvent.target.value)}
                className={sessionFieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-session-duration" className="text-xs">
                Duração
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
                      {option} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-session-amount" className="text-xs">
              Valor da sessão
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
                Padrão do paciente: R$ {selectedPatient.price}
              </p>
            ) : null}
          </div>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Label className="text-xs">Status da sessão</Label>
          <SessionStatusControl value={status} onChange={setStatus} compact />
        </section>

        {status === "faltou" ? (
          <section className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="edit-session-notice" className="text-xs">
                Houve aviso prévio?
              </Label>
              <p className="text-xs text-muted-foreground">
                Com aviso, a sessão não é cobrada.
              </p>
            </div>
            <Switch
              id="edit-session-notice"
              checked={absenceWithNotice}
              onCheckedChange={setAbsenceWithNotice}
            />
          </section>
        ) : null}

        {billablePreview && onMarkPaid ? (
          <section className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs">Pagamento</Label>
              <p className="text-xs text-muted-foreground">
                {isSessionPaid(event)
                  ? "Esta sessão está marcada como paga."
                  : "Sessão pendente de recebimento."}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isSessionPaid(event) ? "outline" : "default"}
              onClick={() => onMarkPaid(event.id, !isSessionPaid(event))}
            >
              {isSessionPaid(event) ? (
                "Desfazer pagamento"
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Marcar como paga
                </>
              )}
            </Button>
          </section>
        ) : null}

        {event.rescheduledFrom ? (
          <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Label className="text-xs">Sessão original</Label>
            <p className="text-sm font-medium">
              {formatRescheduledFromLabel(event.rescheduledFrom)}
            </p>
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
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!(lockedPatient?.name ?? patient) || !start}
          >
            Salvar alterações
          </Button>
        </div>
      </div>
    </form>
  )
}
