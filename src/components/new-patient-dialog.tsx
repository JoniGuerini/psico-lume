import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, Save, Trash2, UserPlus } from "lucide-react"

import type {
  Patient,
  PatientModality,
  PatientSchedule,
  PatientStatus,
  SessionFrequency,
} from "@/data/types"
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
import { TimePicker } from "@/components/ui/time-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  sessionFrequencyOptions,
} from "@/lib/session-frequency"
import { formFieldClass } from "@/lib/form-input-styles"
import { inferPatientModalityFromSchedules } from "@/lib/session-modality"
import { cn } from "@/lib/utils"
import { formatNextSession } from "@/data/patients"
import { useSelectDismissGuard } from "@/lib/use-select-dismiss-guard"
import {
  fetchAddressByCep,
  formatCep,
  isCompleteCep,
  normalizeCep,
} from "@/lib/viacep"
import { formatCpf } from "@/lib/cpf"
import { formatPhone } from "@/lib/phone"
import { useTranslation } from "@/context/locale-provider"
import type { TranslateFn } from "@/i18n/translate"
import {
  formatLocaleDate,
  getModalityLabel,
  getPatientStatusLabel,
  getSessionFrequencyLabel,
} from "@/lib/i18n-helpers"
import type { Locale } from "@/lib/locale"

type NewPatientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
  onCreate?: (patient: Patient) => void
  onUpdate?: (patient: Patient) => void
}

const genderOptions = [
  "Feminino",
  "Masculino",
  "Não-binário",
  "Mulher trans",
  "Homem trans",
  "Prefiro não informar",
]

const referralOptions = [
  "Amigo",
  "Familiar",
  "Rede social",
  "Médico",
  "Outro profissional de saúde",
  "Convênio",
  "Busca na internet",
]

const patientTypes = ["Primeira entrevista", "Recorrente"]

const durations = [30, 45, 50, 60, 75, 90, 120]

const scheduleModalityValues = ["presencial", "online"] as const

const weekdayValues = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const patientStatusValues: PatientStatus[] = [
  "ativo",
  "em-pausa",
  "lista-espera",
  "alta",
]

function getStoredOptionLabel(
  t: TranslateFn,
  category: "gender" | "referral" | "patientType",
  value: string
) {
  return t(`patientForm.options.${category}.${value}`)
}

function getWeekdayLabel(t: TranslateFn, value: string) {
  return t(`patientForm.options.weekdays.${value}`)
}

const OTHER = "__outro"

const fieldClass = formFieldClass

const emptyForm = {
  name: "",
  birthDate: "",
  cpf: "",
  gender: "",
  genderOther: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  phone: "",
  email: "",
  contactName: "",
  contactPhone: "",
  contactRelation: "",
  patientType: "",
  status: "" as PatientStatus | "",
  therapyStart: "",
  price: "",
  referral: "",
  referralOther: "",
  complaint: "",
  notes: "",
  sessionFrequency: "" as SessionFrequency | "",
}

function emptySchedule(): PatientSchedule {
  return { weekday: "", time: "", duration: "", modality: "" }
}

function currentMonthLabel(locale: Locale) {
  const label = formatLocaleDate(new Date(), locale, {
    month: "short",
    year: "numeric",
  })
  return label
    .replace(".", "")
    .replace(/^\w/, (char) => char.toUpperCase())
}

function todayIsoDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

const weekdayFromLabel: Record<string, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
  Domingo: "Dom",
}

function brDateToInput(value?: string) {
  if (!value) return ""
  if (value.includes("-")) return value
  const [day, month, year] = value.split("/")
  if (!day || !month || !year) return ""
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

function inputToBrDate(value: string) {
  if (!value) return ""
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function resolveSelectValue(value: string | undefined, options: string[]) {
  if (!value) return ""
  return options.includes(value) ? value : OTHER
}

function patientToForm(patient: Patient) {
  const gender = resolveSelectValue(patient.gender, genderOptions)
  const referral = resolveSelectValue(patient.referral, referralOptions)

  return {
    name: patient.name,
    birthDate: brDateToInput(patient.birthDate),
    cpf: formatCpf(patient.cpf),
    gender,
    genderOther: gender === OTHER ? patient.gender ?? "" : "",
    cep: patient.cep ?? "",
    street: patient.street ?? "",
    number: patient.number ?? "",
    complement: patient.complement ?? "",
    neighborhood: patient.neighborhood ?? "",
    city: patient.city ?? "",
    state: patient.state ?? "",
    phone: formatPhone(patient.phone),
    email: patient.email,
    contactName: patient.contactName ?? "",
    contactPhone: formatPhone(patient.contactPhone ?? ""),
    contactRelation: patient.contactRelation ?? "",
    patientType: patient.patientType ?? "",
    status: patient.status,
    therapyStart: brDateToInput(patient.therapyStart),
    price: patient.price,
    referral,
    referralOther: referral === OTHER ? patient.referral ?? "" : "",
    complaint: patient.complaint === "—" ? "" : patient.complaint,
    notes: patient.notes ?? "",
    sessionFrequency: (patient.sessionFrequency ?? "") as SessionFrequency | "",
  }
}

function normalizeSchedules(schedules: PatientSchedule[]): PatientSchedule[] {
  return schedules.map((schedule) => ({
    ...schedule,
    weekday: weekdayFromLabel[schedule.weekday] ?? schedule.weekday,
    duration: schedule.duration || "",
    modality: (schedule.modality || "") as PatientModality | "",
  }))
}

function patientSchedules(patient: Patient) {
  if (patient.schedules?.length) {
    return normalizeSchedules(patient.schedules)
  }
  if (patient.sessionTime && patient.sessionDay) {
    return [
      {
        weekday: weekdayFromLabel[patient.sessionDay] ?? patient.sessionDay,
        time: patient.sessionTime,
        duration: String(patient.sessionDuration ?? 50),
        modality:
          patient.modality === "hibrido" ? ("" as PatientModality | "") : patient.modality,
      },
    ]
  }
  return []
}

function buildPatientPayload(
  form: typeof emptyForm,
  schedules: PatientSchedule[],
  locale: Locale,
  base?: Patient
): Patient {
  const first = schedules.find((row) => row.time !== "") ?? schedules[0]
  const sessionDay = first?.weekday ?? ""
  const sessionTime = first?.time ?? ""
  const sessionDuration = Number(first?.duration || 50)
  const nextSession =
    form.status === "ativo" && sessionTime
      ? formatNextSession(sessionDay, sessionTime)
      : null

  const gender = form.gender === OTHER ? form.genderOther.trim() : form.gender
  const referral =
    form.referral === OTHER ? form.referralOther.trim() : form.referral

  return {
    id: base?.id ?? crypto.randomUUID(),
    name: form.name.trim(),
    cpf: form.cpf.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    complaint: form.complaint.trim() || "—",
    modality: inferPatientModalityFromSchedules(schedules),
    price: form.price.trim(),
    status: (form.status || "ativo") as PatientStatus,
    sessionDay,
    sessionTime,
    sessionDuration,
    nextSession,
    sessions: base?.sessions ?? 0,
    since: base?.since ?? currentMonthLabel(locale),
    sessionFrequency: form.sessionFrequency || undefined,
    paymentOverdueManual: base?.paymentOverdueManual,
    birthDate: inputToBrDate(form.birthDate) || undefined,
    gender: gender || undefined,
    cep: form.cep.trim() || undefined,
    street: form.street.trim() || undefined,
    number: form.number.trim() || undefined,
    complement: form.complement.trim() || undefined,
    neighborhood: form.neighborhood.trim() || undefined,
    city: form.city.trim() || undefined,
    state: form.state.trim() || undefined,
    contactName: form.contactName.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    contactRelation: form.contactRelation.trim() || undefined,
    patientType: form.patientType || undefined,
    therapyStart: inputToBrDate(form.therapyStart) || undefined,
    referral: referral || undefined,
    notes: form.notes.trim() || undefined,
    schedules,
    recurrenceFrom: base?.recurrenceFrom ?? todayIsoDate(),
  }
}

function FormSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      <h3 className="font-heading text-sm font-semibold text-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({
  label,
  htmlFor,
  required,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
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
    </div>
  )
}

export function NewPatientDialog({
  open,
  onOpenChange,
  patient = null,
  onCreate,
  onUpdate,
}: NewPatientDialogProps) {
  const { t, locale } = useTranslation()
  const isEditing = patient != null
  const [form, setForm] = useState(emptyForm)
  const [schedules, setSchedules] = useState<PatientSchedule[]>([])
  const [cepLookup, setCepLookup] = useState<{
    status: "idle" | "loading" | "error"
    message?: string
  }>({ status: "idle" })
  const cepLookupRequestRef = useRef(0)
  const lastFetchedCepRef = useRef("")
  const {
    onSelectOpenChange,
    shouldBlockDialogClose,
    reset: resetSelectGuard,
    dialogContentHandlers,
  } = useSelectDismissGuard()

  const canSubmit = form.name.trim() !== ""

  useEffect(() => {
    if (!open) {
      resetSelectGuard()
      setCepLookup({ status: "idle" })
      lastFetchedCepRef.current = ""
    }
  }, [open, resetSelectGuard])

  useEffect(() => {
    if (!open) return
    if (patient) {
      setForm(patientToForm(patient))
      setSchedules(patientSchedules(patient))
      return
    }
    setForm(emptyForm)
    setSchedules([])
  }, [open, patient])

  function handleOpenChange(next: boolean) {
    if (!next && shouldBlockDialogClose(null)) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function lookupCep(cep: string) {
    const normalized = normalizeCep(cep)
    if (normalized.length !== 8) return
    if (lastFetchedCepRef.current === normalized) return

    const requestId = ++cepLookupRequestRef.current
    setCepLookup({ status: "loading" })

    try {
      const address = await fetchAddressByCep(cep)
      if (requestId !== cepLookupRequestRef.current) return

      lastFetchedCepRef.current = normalized
      setForm((current) => ({
        ...current,
        cep: address.cep,
        street: address.street || current.street,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city || current.city,
        state: address.state || current.state,
        complement: current.complement || address.complement || "",
      }))
      setCepLookup({ status: "idle" })
      document.getElementById("patient-number")?.focus()
    } catch (error) {
      if (requestId !== cepLookupRequestRef.current) return
      setCepLookup({
        status: "error",
        message:
          error instanceof Error ? error.message : t("patientForm.cepNotFound"),
      })
    }
  }

  function handleCepChange(raw: string) {
    const formatted = formatCep(raw)
    if (normalizeCep(formatted) !== normalizeCep(form.cep)) {
      lastFetchedCepRef.current = ""
    }
    update("cep", formatted)
    if (cepLookup.status === "error") {
      setCepLookup({ status: "idle" })
    }
    if (isCompleteCep(formatted)) {
      void lookupCep(formatted)
    }
  }

  function handlePhoneChange(
    field: "phone" | "contactPhone",
    raw: string
  ) {
    update(field, formatPhone(raw))
  }

  function handleCpfChange(raw: string) {
    update("cpf", formatCpf(raw))
  }

  function addSchedule() {
    setSchedules((current) => [...current, emptySchedule()])
  }

  function removeSchedule(index: number) {
    setSchedules((current) => current.filter((_, i) => i !== index))
  }

  function updateSchedule<K extends keyof PatientSchedule>(
    index: number,
    key: K,
    value: PatientSchedule[K]
  ) {
    setSchedules((current) =>
      current.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    )
  }

  function resetForm() {
    setForm(emptyForm)
    setSchedules([])
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    const payload = buildPatientPayload(
      form,
      schedules,
      locale,
      patient ?? undefined
    )

    if (isEditing) {
      onUpdate?.(payload)
    } else {
      onCreate?.(payload)
    }

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        {...dialogContentHandlers}
        className="!flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-[72rem]"
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? t("patientForm.titleEdit") : t("patientForm.titleNew")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("patientForm.descEdit") : t("patientForm.descNew")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col overflow-hidden"
        >
          <ScrollArea className="h-[calc(92vh-10rem)] shrink-0">
            <div className="flex flex-col gap-4 p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <FormSection title={t("patientForm.sections.personal")}>
                  <div className="grid grid-cols-12 gap-3">
                    <Field
                      label={t("patientForm.fields.fullName")}
                      htmlFor="patient-name"
                      required
                      className="col-span-12"
                    >
                      <Input
                        id="patient-name"
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder={t("patientForm.placeholders.fullName")}
                        className={fieldClass}
                        autoFocus
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.birthDate")}
                      htmlFor="patient-birth"
                      className="col-span-12 sm:col-span-6"
                    >
                      <DatePicker
                        id="patient-birth"
                        value={form.birthDate}
                        onChange={(next) => update("birthDate", next)}
                        maxDate={new Date()}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.cpf")}
                      htmlFor="patient-cpf"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-cpf"
                        value={form.cpf}
                        onChange={(event) =>
                          handleCpfChange(event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.cpf")}
                        inputMode="numeric"
                        maxLength={14}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.gender")}
                      htmlFor="patient-gender"
                      className="col-span-12"
                    >
                      <Select
                        onOpenChange={onSelectOpenChange}
                        value={form.gender}
                        onValueChange={(value) => update("gender", value)}
                      >
                        <SelectTrigger
                          id="patient-gender"
                          className={cn("w-full", fieldClass)}
                        >
                          <SelectValue placeholder={t("patientForm.selectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {getStoredOptionLabel(t, "gender", option)}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER}>
                            {t("patientForm.otherSpecify")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {form.gender === OTHER ? (
                      <Field
                        label={t("patientForm.fields.genderOther")}
                        htmlFor="patient-gender-other"
                        className="col-span-12"
                      >
                        <Input
                          id="patient-gender-other"
                          value={form.genderOther}
                          onChange={(event) =>
                            update("genderOther", event.target.value)
                          }
                          placeholder={t("patientForm.genderOtherPlaceholder")}
                          className={fieldClass}
                        />
                      </Field>
                    ) : null}
                  </div>
                </FormSection>

                <FormSection title={t("patientForm.sections.address")}>
                  <div className="grid grid-cols-12 gap-3">
                    <Field
                      label={t("patientForm.fields.cep")}
                      htmlFor="patient-cep"
                      className="col-span-4 sm:col-span-3"
                    >
                      <div className="relative">
                        <Input
                          id="patient-cep"
                          value={form.cep}
                          onChange={(event) =>
                            handleCepChange(event.target.value)
                          }
                          onBlur={() => {
                            if (isCompleteCep(form.cep)) {
                              void lookupCep(form.cep)
                            }
                          }}
                          placeholder={t("patientForm.placeholders.cep")}
                          inputMode="numeric"
                          maxLength={9}
                          aria-busy={cepLookup.status === "loading"}
                          aria-invalid={cepLookup.status === "error"}
                          className={cn(
                            fieldClass,
                            cepLookup.status === "loading" && "pr-9"
                          )}
                        />
                        {cepLookup.status === "loading" ? (
                          <Loader2
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                          />
                        ) : null}
                      </div>
                      {cepLookup.status === "error" ? (
                        <p className="text-xs text-destructive">
                          {cepLookup.message ?? t("patientForm.cepNotFound")}
                        </p>
                      ) : null}
                    </Field>
                    <Field
                      label={t("patientForm.fields.street")}
                      htmlFor="patient-street"
                      className="col-span-8 sm:col-span-9"
                    >
                      <Input
                        id="patient-street"
                        value={form.street}
                        onChange={(event) =>
                          update("street", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.street")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.number")}
                      htmlFor="patient-number"
                      className="col-span-4 sm:col-span-2"
                    >
                      <Input
                        id="patient-number"
                        value={form.number}
                        onChange={(event) =>
                          update("number", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.number")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.complement")}
                      htmlFor="patient-complement"
                      className="col-span-8 sm:col-span-4"
                    >
                      <Input
                        id="patient-complement"
                        value={form.complement}
                        onChange={(event) =>
                          update("complement", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.complement")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.neighborhood")}
                      htmlFor="patient-neighborhood"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-neighborhood"
                        value={form.neighborhood}
                        onChange={(event) =>
                          update("neighborhood", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.neighborhood")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.city")}
                      htmlFor="patient-city"
                      className="col-span-8 sm:col-span-9"
                    >
                      <Input
                        id="patient-city"
                        value={form.city}
                        onChange={(event) => update("city", event.target.value)}
                        placeholder={t("patientForm.placeholders.city")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.state")}
                      htmlFor="patient-state"
                      className="col-span-4 sm:col-span-3"
                    >
                      <Input
                        id="patient-state"
                        value={form.state}
                        onChange={(event) =>
                          update(
                            "state",
                            event.target.value.toUpperCase().replace(/[^A-Z]/g, "")
                          )
                        }
                        placeholder={t("patientForm.placeholders.state")}
                        maxLength={2}
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title={t("patientForm.sections.contact")} className="lg:col-span-1">
                  <div className="grid grid-cols-12 gap-3">
                    <Field
                      label={t("patientForm.fields.mobile")}
                      htmlFor="patient-phone"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          handlePhoneChange("phone", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.mobile")}
                        inputMode="numeric"
                        maxLength={15}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.email")}
                      htmlFor="patient-email"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-email"
                        type="email"
                        value={form.email}
                        onChange={(event) => update("email", event.target.value)}
                        placeholder={t("patientForm.placeholders.email")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.contactName")}
                      htmlFor="patient-contact-name"
                      className="col-span-12"
                    >
                      <Input
                        id="patient-contact-name"
                        value={form.contactName}
                        onChange={(event) =>
                          update("contactName", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.optional")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.contactPhone")}
                      htmlFor="patient-contact-phone"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-contact-phone"
                        type="tel"
                        value={form.contactPhone}
                        onChange={(event) =>
                          handlePhoneChange("contactPhone", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.mobile")}
                        inputMode="numeric"
                        maxLength={15}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.contactRelation")}
                      htmlFor="patient-contact-relation"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-contact-relation"
                        value={form.contactRelation}
                        onChange={(event) =>
                          update("contactRelation", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.contactRelation")}
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title={t("patientForm.sections.therapy")} className="lg:col-span-1">
                  <div className="grid grid-cols-12 gap-3">
                    <Field
                      label={t("patientForm.fields.complaint")}
                      htmlFor="patient-complaint"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Input
                        id="patient-complaint"
                        value={form.complaint}
                        onChange={(event) =>
                          update("complaint", event.target.value)
                        }
                        placeholder={t("patientForm.placeholders.complaint")}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.patientType")}
                      htmlFor="patient-type"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Select
                        onOpenChange={onSelectOpenChange}
                        value={form.patientType || undefined}
                        onValueChange={(value) => update("patientType", value)}
                      >
                        <SelectTrigger
                          id="patient-type"
                          className={cn("w-full", fieldClass)}
                        >
                          <SelectValue placeholder={t("patientForm.selectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {patientTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {getStoredOptionLabel(t, "patientType", type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field
                      label={t("patientForm.fields.status")}
                      htmlFor="patient-status"
                      className="col-span-12 sm:col-span-6"
                    >
                      <Select
                        onOpenChange={onSelectOpenChange}
                        value={form.status || undefined}
                        onValueChange={(value) =>
                          update("status", value as PatientStatus)
                        }
                      >
                        <SelectTrigger
                          id="patient-status"
                          className={cn("w-full", fieldClass)}
                        >
                          <SelectValue placeholder={t("patientForm.selectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {patientStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getPatientStatusLabel(t, status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field
                      label={t("patientForm.fields.therapyStart")}
                      htmlFor="patient-therapy-start"
                      className="col-span-12 sm:col-span-6"
                    >
                      <DatePicker
                        id="patient-therapy-start"
                        value={form.therapyStart}
                        onChange={(next) => update("therapyStart", next)}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label={t("patientForm.fields.sessionPrice")}
                      htmlFor="patient-price"
                      className="col-span-12 sm:col-span-6"
                    >
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="patient-price"
                          value={form.price}
                          onChange={(event) =>
                            update("price", event.target.value)
                          }
                          placeholder={t("patientForm.placeholders.sessionPrice")}
                          inputMode="decimal"
                          className={cn("pl-9", fieldClass)}
                        />
                      </div>
                    </Field>
                    <Field
                      label={t("patientForm.fields.referral")}
                      htmlFor="patient-referral"
                      className="col-span-12"
                    >
                      <Select
                        onOpenChange={onSelectOpenChange}
                        value={form.referral}
                        onValueChange={(value) => update("referral", value)}
                      >
                        <SelectTrigger
                          id="patient-referral"
                          className={cn("w-full", fieldClass)}
                        >
                          <SelectValue placeholder={t("patientForm.referralPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {referralOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {getStoredOptionLabel(t, "referral", option)}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER}>
                            {t("patientForm.otherSpecify")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {form.referral === OTHER ? (
                      <Field
                        label={t("patientForm.fields.referralOther")}
                        htmlFor="patient-referral-other"
                        className="col-span-12"
                      >
                        <Input
                          id="patient-referral-other"
                          value={form.referralOther}
                          onChange={(event) =>
                            update("referralOther", event.target.value)
                          }
                          placeholder={t("patientForm.referralOtherPlaceholder")}
                          className={fieldClass}
                        />
                      </Field>
                    ) : null}
                  </div>
                </FormSection>
              </div>

              <FormSection title={t("patientForm.sections.schedules")}>
                <Field
                  label={t("patientForm.fields.sessionFrequency")}
                  htmlFor="patient-session-frequency"
                  className="max-w-md"
                >
                  <Select
                    onOpenChange={onSelectOpenChange}
                    value={form.sessionFrequency || undefined}
                    onValueChange={(value) =>
                      update("sessionFrequency", value as SessionFrequency)
                    }
                  >
                    <SelectTrigger
                      id="patient-session-frequency"
                      className={cn("w-full", fieldClass)}
                    >
                      <SelectValue placeholder={t("patientForm.frequencyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionFrequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {getSessionFrequencyLabel(t, option.value)} ·{" "}
                          {t(`patientForm.frequencyDescriptions.${option.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {schedules.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                    {t("patientForm.noSchedules")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {schedules.map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-background/40 p-3 sm:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto]"
                      >
                        <Field label={t("patientForm.fields.weekday")}>
                          <Select
                            onOpenChange={onSelectOpenChange}
                            value={row.weekday || undefined}
                            onValueChange={(value) =>
                              updateSchedule(index, "weekday", value)
                            }
                          >
                            <SelectTrigger className={cn("w-full", fieldClass)}>
                              <SelectValue placeholder={t("patientForm.weekdayPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {weekdayValues.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {getWeekdayLabel(t, value)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label={t("patientForm.fields.time")}>
                          <TimePicker
                            value={row.time}
                            onChange={(next) =>
                              updateSchedule(index, "time", next)
                            }
                            placeholder={t("patientForm.placeholders.time")}
                            startHour={6}
                            endHour={22}
                            className={fieldClass}
                          />
                        </Field>
                        <Field label={t("patientForm.fields.duration")}>
                          <Select
                            onOpenChange={onSelectOpenChange}
                            value={row.duration || undefined}
                            onValueChange={(value) =>
                              updateSchedule(index, "duration", value)
                            }
                          >
                            <SelectTrigger className={cn("w-full", fieldClass)}>
                              <SelectValue placeholder={t("patientForm.placeholders.duration")} />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((duration) => (
                                <SelectItem
                                  key={duration}
                                  value={String(duration)}
                                >
                                  {t("patientForm.durationMinutes", {
                                    count: duration,
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label={t("patientForm.fields.modality")}>
                          <Select
                            onOpenChange={onSelectOpenChange}
                            value={row.modality || undefined}
                            onValueChange={(value) =>
                              updateSchedule(
                                index,
                                "modality",
                                value as PatientModality
                              )
                            }
                          >
                            <SelectTrigger className={cn("w-full", fieldClass)}>
                              <SelectValue placeholder={t("patientForm.selectPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {scheduleModalityValues.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {getModalityLabel(t, value)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeSchedule(index)}
                          aria-label={t("patientForm.removeSchedule")}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start border-border bg-background/40 hover:bg-accent/50"
                  onClick={addSchedule}
                >
                  <Plus />
                  {t("patientForm.addSchedule")}
                </Button>
              </FormSection>

              <FormSection title={t("patientForm.sections.notes")}>
                <Textarea
                  id="patient-notes"
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  placeholder={t("patientForm.placeholders.notes")}
                  className={cn("min-h-24 resize-none", fieldClass)}
                  rows={3}
                />
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
              {isEditing ? (
                <>
                  <Save />
                  {t("patientForm.saveChanges")}
                </>
              ) : (
                <>
                  <UserPlus />
                  {t("patientForm.addPatient")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
