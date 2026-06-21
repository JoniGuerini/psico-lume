import { useMemo, useState } from "react"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"

import { NewSessionNoteDialog } from "@/components/new-session-note-dialog"
import { modalityLabel } from "@/components/patients-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useClinicData } from "@/context/clinic-data-provider"
import { getLatestRecord, getRecordsForPatient } from "@/data/clinical-records"
import type { Patient, SessionNote } from "@/data/types"

type PatientRecordsTabProps = {
  patient: Patient
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" className="gap-1 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-xl font-semibold tracking-tight">
        {value}
      </span>
    </Card>
  )
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: SessionNote
  onEdit: (note: SessionNote) => void
  onDelete: (note: SessionNote) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left transition-colors hover:opacity-90"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/40">
            <BookOpen className="size-4 text-muted-foreground" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-sm font-semibold">
                Sessão {note.sessionNumber}
              </span>
              <Badge
                variant="outline"
                className="border-border bg-background/40 text-xs"
              >
                <Calendar className="size-3" />
                {note.date}
              </Badge>
              {note.mood ? (
                <Badge
                  variant="outline"
                  className="border-border bg-background/40 text-xs"
                >
                  {note.mood}
                </Badge>
              ) : null}
              {note.modality ? (
                <Badge
                  variant="outline"
                  className="border-border bg-background/40 text-xs"
                >
                  {modalityLabel[note.modality]}
                </Badge>
              ) : null}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {note.summary}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="mt-1 size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground" />
          )}
        </button>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Editar evolução"
            onClick={() => onEdit(note)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Excluir evolução"
            onClick={() => onDelete(note)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t border-border bg-background/40 px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Resumo
            </span>
            <p className="text-sm leading-relaxed">{note.summary}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Evolução clínica
            </span>
            <p className="text-sm leading-relaxed">{note.evolution}</p>
          </div>
          {note.plan ? (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Plano / tarefa
                </span>
                <p className="text-sm leading-relaxed">{note.plan}</p>
              </div>
            </>
          ) : null}
          {note.tags && note.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {note.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-border bg-background/40 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}

export function PatientRecordsTab({ patient }: PatientRecordsTabProps) {
  const {
    sessionNotes,
    addSessionNote,
    updateSessionNote,
    deleteSessionNote,
  } = useClinicData()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SessionNote | null>(null)

  const notes = useMemo(
    () => getRecordsForPatient(sessionNotes, patient.id),
    [sessionNotes, patient.id]
  )

  const latest = useMemo(
    () => getLatestRecord(sessionNotes, patient.id),
    [sessionNotes, patient.id]
  )

  const nextSessionNumber = useMemo(() => {
    const maxNumber = notes.reduce(
      (max, note) => Math.max(max, note.sessionNumber),
      0
    )
    return Math.max(maxNumber + 1, patient.sessions + 1)
  }, [notes, patient.sessions])

  const uniqueTags = useMemo(() => {
    const set = new Set<string>()
    for (const note of notes) {
      note.tags?.forEach((tag) => set.add(tag))
    }
    return set.size
  }, [notes])

  function openCreateDialog() {
    setEditingNote(null)
    setDialogOpen(true)
  }

  function openEditDialog(note: SessionNote) {
    setEditingNote(note)
    setDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) setEditingNote(null)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteSessionNote(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 border-transparent bg-sidebar p-5 text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <ClipboardList className="size-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold text-primary-foreground">
              Prontuário clínico
            </h3>
            <p className="text-sm text-sidebar-foreground/75">
              Histórico de evolução e notas de sessão de {patient.name}.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          onClick={() => openCreateDialog()}
        >
          <Plus />
          Nova evolução
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Notas registradas" value={String(notes.length)} />
        <Stat
          label="Última sessão"
          value={latest?.date ?? "—"}
        />
        <Stat label="Tags distintas" value={String(uniqueTags)} />
        <Stat label="Abordagem" value={patient.approach || "—"} />
      </div>

      {latest ? (
        <Card className="gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <h4 className="font-heading text-sm font-semibold">
                Última evolução
              </h4>
            </div>
            <Badge
              variant="outline"
              className="ml-auto border-border bg-background/40"
            >
              Sessão {latest.sessionNumber} · {latest.date}
            </Badge>
          </div>
          <Separator />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {latest.evolution}
          </p>
          {latest.plan ? (
            <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">Plano: </span>
              <span className="text-muted-foreground">{latest.plan}</span>
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading text-base font-semibold">
            Histórico de sessões
          </h4>
          <span className="text-sm text-muted-foreground">
            {notes.length}{" "}
            {notes.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {notes.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed bg-background/40 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
              <BookOpen className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Nenhuma evolução registrada</p>
              <p className="text-sm text-muted-foreground">
                Comece registrando a primeira sessão ou entrevista inicial.
              </p>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus />
              Nova evolução
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={openEditDialog}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      <NewSessionNoteDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        patient={patient}
        nextSessionNumber={nextSessionNumber}
        note={editingNote}
        onCreate={addSessionNote}
        onUpdate={updateSessionNote}
      />

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">Excluir evolução?</DialogTitle>
            <DialogDescription>
              A nota da sessão {deleteTarget?.sessionNumber} (
              {deleteTarget?.date}) será removida permanentemente do prontuário
              de {patient.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <Trash2 />
              Excluir evolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
