import { useEffect, useRef, useState } from "react"
import { Save } from "lucide-react"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground/80">{hint}</p> : null}
    </div>
  )
}

export function NewSessionNoteDialog({
  open,
  onOpenChange,
  patient,
  nextSessionNumber,
  onCreate,
}: NewSessionNoteDialogProps) {
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const [date, setDate] = useState(toDateInput(todayBr()))
  const [summary, setSummary] = useState("")
  const [evolution, setEvolution] = useState("")
  const [plan, setPlan] = useState("")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState("")
  const [modality, setModality] = useState<PatientModality>(
    patient.modality === "hibrido" ? "online" : patient.modality
  )

  const canSubmit = summary.trim().length > 0 && evolution.trim().length > 0

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

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

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => summaryRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    onCreate({
      id: crypto.randomUUID(),
      patientId: patient.id,
      date: fromDateInput(date),
      sessionNumber: nextSessionNumber,
      summary: summary.trim(),
      evolution: evolution.trim(),
      plan: plan.trim() || undefined,
      tags: parsedTags,
      mood: mood || undefined,
      modality,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Nova evolução</DialogTitle>
          <DialogDescription>
            Registre a nota da sessão de{" "}
            <span className="font-medium text-foreground">{patient.name}</span>.
            Resumo e evolução clínica são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col overflow-hidden"
        >
          <ScrollArea className="h-[calc(92vh-10rem)] shrink-0">
            <div className="flex flex-col gap-4 p-6">
              <FormSection
                title="Identificação da sessão"
                description="Metadados do encontro — preenchidos antes do registro clínico."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Data da sessão" htmlFor="note-date">
                    <Input
                      id="note-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className={fieldClass}
                      required
                    />
                  </Field>
                  <Field label="Nº da sessão">
                    <div
                      className="flex h-9 items-center rounded-xl border border-border bg-muted/50 px-3 font-heading text-sm font-semibold tabular-nums text-foreground"
                      aria-live="polite"
                    >
                      {nextSessionNumber}ª sessão
                    </div>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Humor / estado" htmlFor="note-mood">
                    <Select value={mood} onValueChange={setMood}>
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
                  </Field>
                  <Field label="Modalidade" htmlFor="note-modality">
                    <Select
                      value={modality}
                      onValueChange={(value) =>
                        setModality(value as PatientModality)
                      }
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
                  </Field>
                </div>
              </FormSection>

              <FormSection
                title="Registro clínico"
                description="Conteúdo principal do prontuário desta sessão."
              >
                <Field
                  label="Resumo da sessão"
                  htmlFor="note-summary"
                  required
                  hint="Temas abordados, queixas trazidas e contexto do encontro."
                >
                  <Textarea
                    ref={summaryRef}
                    id="note-summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="O que foi trabalhado, queixas e contexto..."
                    rows={4}
                    className={cn(fieldClass, "min-h-24 resize-y")}
                    required
                  />
                </Field>

                <Field
                  label="Evolução clínica"
                  htmlFor="note-evolution"
                  required
                  hint="Progressos observados, intervenções realizadas e impressões clínicas."
                >
                  <Textarea
                    id="note-evolution"
                    value={evolution}
                    onChange={(event) => setEvolution(event.target.value)}
                    placeholder="Observações clínicas, progressos e insights..."
                    rows={5}
                    className={cn(fieldClass, "min-h-28 resize-y")}
                    required
                  />
                </Field>

                <Separator />

                <Field
                  label="Plano / tarefa de casa"
                  htmlFor="note-plan"
                  hint="Opcional — próximos passos acordados com o paciente."
                >
                  <Textarea
                    id="note-plan"
                    value={plan}
                    onChange={(event) => setPlan(event.target.value)}
                    placeholder="Próximos passos acordados com o paciente..."
                    rows={3}
                    className={cn(fieldClass, "min-h-20 resize-y")}
                  />
                </Field>

                <Field
                  label="Tags"
                  htmlFor="note-tags"
                  hint="Separe por vírgula — ex.: TCC, Ansiedade, Progresso."
                >
                  <Input
                    id="note-tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="TCC, Ansiedade, Progresso"
                    className={fieldClass}
                  />
                  {parsedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {parsedTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Field>
              </FormSection>
            </div>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border bg-card/60 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="hover:bg-accent/50"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Save />
              Salvar evolução
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
