import { useState } from "react"
import { Trash2 } from "lucide-react"

import { EditSessionForm } from "@/components/edit-session-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useClinicData } from "@/context/clinic-data-provider"
import type { CalendarEvent, Patient } from "@/data/types"
import {
  formatRescheduledFromLabel,
  getEventStatus,
  sessionStatusConfig,
} from "@/lib/session-status"

type EditSessionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  patientNames: string[]
  patients: Patient[]
  onSave: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
}

export function EditSessionDialog({
  open,
  onOpenChange,
  event,
  patientNames,
  patients,
  onSave,
  onDelete,
}: EditSessionDialogProps) {
  const { markEventPaid } = useClinicData()
  const [selectOpen, setSelectOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next && selectOpen) return
    if (!next) setDeleteConfirmOpen(false)
    onOpenChange(next)
  }

  function handleConfirmDelete() {
    if (!event) return
    onDelete?.(event.id)
    setDeleteConfirmOpen(false)
    onOpenChange(false)
  }

  if (!event) return null

  const status = getEventStatus(event)
  const statusLabel = sessionStatusConfig[status].label

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md"
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
            onDeleteRequest={onDelete ? () => setDeleteConfirmOpen(true) : undefined}
            onMarkPaid={markEventPaid}
            onSelectOpenChange={setSelectOpen}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">Excluir sessão?</DialogTitle>
            <DialogDescription>
              A sessão de <span className="font-medium text-foreground">{event.title}</span>{" "}
              em {event.date.toLocaleDateString("pt-BR")} às {event.start} será
              removida da agenda permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 />
              Excluir sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
