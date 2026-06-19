import { useMemo, useState } from "react"

import { ScheduleSessionForm } from "@/components/schedule-session-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CalendarEvent, Patient } from "@/data/types"
import { buildSessionDefaults } from "@/lib/session-scheduling"

type ScheduleSessionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  patients?: Patient[]
  onSchedule: (event: CalendarEvent) => void
}

export function ScheduleSessionDialog({
  open,
  onOpenChange,
  patient,
  patients = [],
  onSchedule,
}: ScheduleSessionDialogProps) {
  const [selectOpen, setSelectOpen] = useState(false)
  const defaults = useMemo(() => buildSessionDefaults(patient), [patient])

  function handleOpenChange(next: boolean) {
    if (!next && selectOpen) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden bg-[#FAF6EC] p-0 sm:max-w-md"
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
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Agendar sessão</DialogTitle>
          <DialogDescription>
            Nova sessão para {patient.name}. Horário recorrente sugerido
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <ScheduleSessionForm
          key={`${patient.id}-${open}`}
          idPrefix="profile-session"
          showHeader={false}
          lockedPatient={{ id: patient.id, name: patient.name }}
          patients={patients.length > 0 ? patients : [patient]}
          defaults={defaults}
          submitLabel="Agendar sessão"
          onSubmit={(event) => {
            onSchedule(event)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
          onSelectOpenChange={setSelectOpen}
        />
      </DialogContent>
    </Dialog>
  )
}
