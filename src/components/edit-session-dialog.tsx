import { useState } from "react"

import { EditSessionForm } from "@/components/edit-session-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CalendarEvent, Patient } from "@/data/types"
import { getEventStatus, formatRescheduledFromLabel, sessionStatusConfig } from "@/lib/session-status"

type EditSessionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  patientNames: string[]
  patients: Patient[]
  onSave: (event: CalendarEvent) => void
}

export function EditSessionDialog({
  open,
  onOpenChange,
  event,
  patientNames,
  patients,
  onSave,
}: EditSessionDialogProps) {
  const [selectOpen, setSelectOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next && selectOpen) return
    onOpenChange(next)
  }

  if (!event) return null

  const status = getEventStatus(event)
  const statusLabel = sessionStatusConfig[status].label

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden bg-[#FAF6EC] p-0 sm:max-w-md"
        onPointerDownOutside={(dialogEvent) => {
          if (selectOpen) dialogEvent.preventDefault()
        }}
        onInteractOutside={(dialogEvent) => {
          if (selectOpen) dialogEvent.preventDefault()
        }}
        onEscapeKeyDown={(dialogEvent) => {
          if (selectOpen) dialogEvent.preventDefault()
        }}
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Editar sessão</DialogTitle>
          <DialogDescription>
            {event.title} · {statusLabel}.
            {event.rescheduledFrom
              ? ` Reagendada de ${formatRescheduledFromLabel(event.rescheduledFrom)}.`
              : " Ajuste horário, data ou comparecimento."}
          </DialogDescription>
        </DialogHeader>

        <EditSessionForm
          key={event.id}
          event={event}
          patientNames={patientNames}
          patients={patients}
          onSubmit={(updated) => {
            onSave(updated)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
          onSelectOpenChange={setSelectOpen}
        />
      </DialogContent>
    </Dialog>
  )
}
