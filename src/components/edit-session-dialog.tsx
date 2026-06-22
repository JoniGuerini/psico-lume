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
import { useTranslation } from "@/context/locale-provider"
import type { CalendarEvent, Patient } from "@/data/types"
import {
  formatLocaleDate,
  formatRescheduledFromLabel,
  getModalityLabel,
  getSessionStatusLabel,
} from "@/lib/i18n-helpers"
import { getEventStatus } from "@/lib/session-status"
import { resolveSessionModality } from "@/lib/session-modality"

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
  const { t, locale } = useTranslation()
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
  const statusLabel = getSessionStatusLabel(t, status)
  const patientRecord = patients.find((item) => item.id === event.patientId)
  const sessionModality = resolveSessionModality(event, patientRecord)
  const modalityLabel = sessionModality
    ? getModalityLabel(t, sessionModality)
    : null

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="!flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md"
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
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">
              {t("sessionForm.editTitle")}
            </DialogTitle>
            <DialogDescription>
              {event.title} · {statusLabel}
              {modalityLabel ? ` · ${modalityLabel}` : ""}.
              {event.rescheduledFrom
                ? t("sessionForm.editRescheduled", {
                    from: formatRescheduledFromLabel(
                      event.rescheduledFrom,
                      locale
                    ),
                  })
                : t("sessionForm.editDefault")}
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
            <DialogTitle className="text-lg">
              {t("sessionForm.deleteTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("sessionForm.deleteDescription", {
                title: event.title,
                date: formatLocaleDate(event.date, locale),
                time: event.start,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 />
              {t("sessionForm.deleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
