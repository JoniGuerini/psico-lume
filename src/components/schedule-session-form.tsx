import { useState } from "react"
import { CalendarPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import type { CalendarEvent } from "@/data/types"
import {
  durationOptions,
  fromDateInput,
  minutesToTime,
  sessionFieldClass,
  toDateInput,
  toMinutes,
} from "@/lib/session-scheduling"
import { cn } from "@/lib/utils"

type LockedPatient = {
  id: string
  name: string
}

type ScheduleSessionFormProps = {
  defaults: { date: Date; start: string; duration: number }
  patientNames?: string[]
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
  lockedPatient,
  showHeader = true,
  submitLabel = "Salvar",
  onSubmit,
  onCancel,
  onSelectOpenChange,
  idPrefix = "session",
}: ScheduleSessionFormProps) {
  const [patient, setPatient] = useState(
    lockedPatient?.name ?? patientNames[0] ?? ""
  )
  const [date, setDate] = useState(toDateInput(defaults.date))
  const [start, setStart] = useState(defaults.start)
  const [duration, setDuration] = useState(String(defaults.duration))

  function handleSelectOpenChange(open: boolean) {
    onSelectOpenChange?.(open)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const patientName = lockedPatient?.name ?? patient
    if (!patientName || !start) return

    const startMin = toMinutes(start)
    onSubmit({
      id: crypto.randomUUID(),
      patientId: lockedPatient?.id ?? "",
      title: patientName,
      date: fromDateInput(date),
      start,
      end: minutesToTime(startMin + Number(duration)),
      status: "agendada",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {showHeader ? (
        <PopoverHeader className="gap-1 border-b border-border px-4 py-3">
          <PopoverTitle className="font-heading text-base">
            Novo atendimento
          </PopoverTitle>
          <PopoverDescription className="text-xs">
            Preencha os dados para agendar a sessão.
          </PopoverDescription>
        </PopoverHeader>
      ) : null}

      <div className="flex flex-col gap-4 p-4">
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-patient`} className="text-xs">
              Paciente
            </Label>
            {lockedPatient ? (
              <Input
                id={`${idPrefix}-patient`}
                value={lockedPatient.name}
                readOnly
                className={cn(sessionFieldClass, "bg-background/60")}
              />
            ) : (
              <Select
                value={patient}
                onValueChange={setPatient}
                onOpenChange={handleSelectOpenChange}
              >
                <SelectTrigger
                  id={`${idPrefix}-patient`}
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
            <Label htmlFor={`${idPrefix}-date`} className="text-xs">
              Data
            </Label>
            <Input
              id={`${idPrefix}-date`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={sessionFieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-start`} className="text-xs">
                Início
              </Label>
              <Input
                id={`${idPrefix}-start`}
                type="time"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                className={sessionFieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-duration`} className="text-xs">
                Duração
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
        </section>

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
            {submitLabel === "Salvar" ? null : <CalendarPlus />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
