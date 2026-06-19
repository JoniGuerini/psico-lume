import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { modalityLabel } from "@/components/patients-page"
import type { Patient, PatientModality, SessionNote } from "@/data/types"
import { cn } from "@/lib/utils"

const fieldClass =
  "border-border bg-background/40 hover:bg-accent/50 focus-visible:bg-card"

const moodOptions = [
  "Ansioso(a)",
  "Estável",
  "Melhor",
  "Triste",
  "Esperançoso(a)",
  "Exausto(a)",
  "Emocional",
  "Reflexivo(a)",
  "Hipervigilante",
]

type NewSessionNoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  nextSessionNumber: number
  onCreate: (note: SessionNote) => void
}

function todayBr() {
  return new Date().toLocaleDateString("pt-BR")
}

function toDateInput(brDate: string) {
  const [day, month, year] = brDate.split("/")
  return `${year}-${month}-${day}`
}

function fromDateInput(value: string) {
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}

export function NewSessionNoteDialog({
  open,
  onOpenChange,
  patient,
  nextSessionNumber,
  onCreate,
}: NewSessionNoteDialogProps) {
  const [selectOpen, setSelectOpen] = useState(false)
  const [date, setDate] = useState(toDateInput(todayBr()))
  const [summary, setSummary] = useState("")
  const [evolution, setEvolution] = useState("")
  const [plan, setPlan] = useState("")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState("")
  const [modality, setModality] = useState<PatientModality>(
    patient.modality === "hibrido" ? "online" : patient.modality
  )

  function resetForm() {
    setDate(toDateInput(todayBr()))
    setSummary("")
    setEvolution("")
    setPlan("")
    setTags("")
    setMood("")
    setModality(
      patient.modality === "hibrido" ? "online" : patient.modality
    )
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    onOpenChange(next)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!summary.trim() || !evolution.trim()) return

    onCreate({
      id: crypto.randomUUID(),
      patientId: patient.id,
      date: fromDateInput(date),
      sessionNumber: nextSessionNumber,
      summary: summary.trim(),
      evolution: evolution.trim(),
      plan: plan.trim() || undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      mood: mood || undefined,
      modality,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="!flex max-h-[92vh] min-h-0 w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-[#FAF6EC] p-0 sm:max-w-lg"
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
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Nova evolução</DialogTitle>
          <DialogDescription>
            Registre a nota da sessão de {patient.name}. Resumo e evolução são
            obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
            <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note-date">Data da sessão</Label>
                  <Input
                    id="note-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note-session">Nº da sessão</Label>
                  <Input
                    id="note-session"
                    value={String(nextSessionNumber)}
                    readOnly
                    className={cn(fieldClass, "bg-background/60")}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note-mood">Humor / estado</Label>
                  <Select
                    value={mood}
                    onValueChange={setMood}
                    onOpenChange={setSelectOpen}
                  >
                    <SelectTrigger id="note-mood" className={fieldClass}>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note-modality">Modalidade</Label>
                  <Select
                    value={modality}
                    onValueChange={(value) =>
                      setModality(value as PatientModality)
                    }
                    onOpenChange={setSelectOpen}
                  >
                    <SelectTrigger id="note-modality" className={fieldClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["presencial", "online"] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {modalityLabel[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note-summary">
                  Resumo da sessão <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="note-summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="O que foi trabalhado, queixas e contexto..."
                  rows={3}
                  className={cn(fieldClass, "resize-none")}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note-evolution">
                  Evolução clínica <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="note-evolution"
                  value={evolution}
                  onChange={(event) => setEvolution(event.target.value)}
                  placeholder="Observações clínicas, progressos e insights..."
                  rows={4}
                  className={cn(fieldClass, "resize-none")}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note-plan">Plano / tarefa de casa</Label>
                <Textarea
                  id="note-plan"
                  value={plan}
                  onChange={(event) => setPlan(event.target.value)}
                  placeholder="Próximos passos acordados com o paciente..."
                  rows={2}
                  className={cn(fieldClass, "resize-none")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note-tags">Tags</Label>
                <Input
                  id="note-tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="TCC, Ansiedade, Progresso (separadas por vírgula)"
                  className={fieldClass}
                />
              </div>
            </section>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="hover:bg-accent/50"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!summary.trim() || !evolution.trim()}>
              <Plus />
              Salvar evolução
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
