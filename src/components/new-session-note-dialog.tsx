import { useEffect, useRef, useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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
import { useTranslation } from "@/context/locale-provider"
import type { Patient, PatientModality, SessionNote } from "@/data/types"
import { formFieldClass } from "@/lib/form-input-styles"
import {
  formatLocaleDate,
  getModalityLabel,
  getMoodLabel,
  MOOD_KEYS,
} from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"
import { fromDateInput, toDateInput } from "@/lib/session-scheduling"
import { useSelectDismissGuard } from "@/lib/use-select-dismiss-guard"
import { cn } from "@/lib/utils"

const fieldClass = formFieldClass

type NewSessionNoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  nextSessionNumber: number
  note?: SessionNote | null
  onCreate: (note: SessionNote) => void
  onUpdate?: (note: SessionNote) => void
}

function storedDateToIso(stored: string) {
  if (stored.includes("/")) {
    const [day, month, year] = stored.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  return stored
}

function isoToStoredDate(iso: string, locale: Locale) {
  return formatLocaleDate(fromDateInput(iso), locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
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

function noteToFormState(note: SessionNote, patient: Patient) {
  return {
    date: storedDateToIso(note.date),
    summary: note.summary,
    evolution: note.evolution,
    plan: note.plan ?? "",
    tags: note.tags?.join(", ") ?? "",
    mood: note.mood ?? "",
    modality: note.modality ?? (patient.modality === "hibrido" ? "online" : patient.modality),
  }
}

export function NewSessionNoteDialog({
  open,
  onOpenChange,
  patient,
  nextSessionNumber,
  note = null,
  onCreate,
  onUpdate,
}: NewSessionNoteDialogProps) {
  const { t, locale } = useTranslation()
  const isEditing = note != null
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const [date, setDate] = useState(toDateInput(new Date()))
  const [summary, setSummary] = useState("")
  const [evolution, setEvolution] = useState("")
  const [plan, setPlan] = useState("")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState("")
  const [modality, setModality] = useState<PatientModality>(
    patient.modality === "hibrido" ? "online" : patient.modality
  )
  const {
    onSelectOpenChange,
    shouldBlockDialogClose,
    reset: resetSelectGuard,
    dialogContentHandlers,
  } = useSelectDismissGuard()

  const sessionNumber = isEditing ? note.sessionNumber : nextSessionNumber

  const canSubmit = summary.trim().length > 0 && evolution.trim().length > 0

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  function resetForm() {
    if (isEditing && note) {
      const state = noteToFormState(note, patient)
      setDate(state.date)
      setSummary(state.summary)
      setEvolution(state.evolution)
      setPlan(state.plan)
      setTags(state.tags)
      setMood(state.mood)
      setModality(state.modality as PatientModality)
      return
    }

    setDate(toDateInput(new Date()))
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
    if (!next && shouldBlockDialogClose(null)) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open) resetSelectGuard()
  }, [open, resetSelectGuard])

  useEffect(() => {
    if (!open) return
    if (isEditing && note) {
      const state = noteToFormState(note, patient)
      setDate(state.date)
      setSummary(state.summary)
      setEvolution(state.evolution)
      setPlan(state.plan)
      setTags(state.tags)
      setMood(state.mood)
      setModality(state.modality as PatientModality)
    }
    const timer = window.setTimeout(() => summaryRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open, isEditing, note, patient])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    const payload: SessionNote = {
      id: isEditing && note ? note.id : crypto.randomUUID(),
      patientId: patient.id,
      date: isoToStoredDate(date, locale),
      sessionNumber,
      summary: summary.trim(),
      evolution: evolution.trim(),
      plan: plan.trim() || undefined,
      tags: parsedTags,
      mood: mood || undefined,
      modality,
    }

    if (isEditing && note) {
      onUpdate?.(payload)
    } else {
      onCreate(payload)
    }

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        {...dialogContentHandlers}
        className="!flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? t("sessionNote.titleEdit") : t("sessionNote.titleNew")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("sessionNote.descEdit", { name: patient.name })
              : t("sessionNote.descCreate", { name: patient.name })}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col overflow-hidden"
        >
          <ScrollArea className="h-[calc(92vh-10rem)] shrink-0">
            <div className="flex flex-col gap-4 p-6">
              <FormSection
                title={t("sessionNote.sections.identification.title")}
                description={t("sessionNote.sections.identification.description")}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("sessionNote.sessionDate")} htmlFor="note-date">
                    <DatePicker
                      id="note-date"
                      value={date}
                      onChange={setDate}
                      placeholder={t("sessionNote.placeholders.sessionDate")}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={t("sessionNote.sessionNumber")}>
                    <div
                      className="flex h-9 items-center rounded-xl border border-border bg-muted/50 px-3 font-heading text-sm font-semibold tabular-nums text-foreground"
                      aria-live="polite"
                    >
                      {t("sessionNote.sessionNumberLabel", {
                        number: sessionNumber,
                      })}
                    </div>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("sessionNote.mood")} htmlFor="note-mood">
                    <Select
                      onOpenChange={onSelectOpenChange}
                      value={mood}
                      onValueChange={setMood}
                    >
                      <SelectTrigger id="note-mood" className={fieldClass}>
                        <SelectValue placeholder={t("sessionNote.selectOptional")} />
                      </SelectTrigger>
                      <SelectContent>
                        {MOOD_KEYS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {getMoodLabel(t, option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("sessionNote.modality")} htmlFor="note-modality">
                    <Select
                      onOpenChange={onSelectOpenChange}
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
                            {getModalityLabel(t, value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FormSection>

              <FormSection
                title={t("sessionNote.sections.clinical.title")}
                description={t("sessionNote.sections.clinical.description")}
              >
                <Field
                  label={t("sessionNote.summary")}
                  htmlFor="note-summary"
                  required
                  hint={t("sessionNote.hints.summary")}
                >
                  <Textarea
                    ref={summaryRef}
                    id="note-summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder={t("sessionNote.placeholders.summary")}
                    rows={4}
                    className={cn(fieldClass, "min-h-24 resize-y")}
                    required
                  />
                </Field>

                <Field
                  label={t("sessionNote.evolution")}
                  htmlFor="note-evolution"
                  required
                  hint={t("sessionNote.hints.evolution")}
                >
                  <Textarea
                    id="note-evolution"
                    value={evolution}
                    onChange={(event) => setEvolution(event.target.value)}
                    placeholder={t("sessionNote.placeholders.evolution")}
                    rows={5}
                    className={cn(fieldClass, "min-h-28 resize-y")}
                    required
                  />
                </Field>

                <Separator />

                <Field
                  label={t("sessionNote.plan")}
                  htmlFor="note-plan"
                  hint={t("sessionNote.hints.plan")}
                >
                  <Textarea
                    id="note-plan"
                    value={plan}
                    onChange={(event) => setPlan(event.target.value)}
                    placeholder={t("sessionNote.placeholders.plan")}
                    rows={3}
                    className={cn(fieldClass, "min-h-20 resize-y")}
                  />
                </Field>

                <Field
                  label={t("sessionNote.tags")}
                  htmlFor="note-tags"
                  hint={t("sessionNote.hints.tags")}
                >
                  <Input
                    id="note-tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder={t("sessionNote.placeholders.tags")}
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Save />
              {isEditing
                ? t("sessionNote.saveChanges")
                : t("sessionNote.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
