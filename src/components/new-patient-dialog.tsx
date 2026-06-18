import { useState } from "react"
import { Plus, Trash2, UserPlus } from "lucide-react"

import type {
  Patient,
  PatientModality,
  PatientSchedule,
  PatientStatus,
} from "@/components/patients-page"
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

type NewPatientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (patient: Patient) => void
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

const modalityOptions: { value: PatientModality; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
]

const weekdays = [
  { value: "Seg", label: "Segunda-feira" },
  { value: "Ter", label: "Terça-feira" },
  { value: "Qua", label: "Quarta-feira" },
  { value: "Qui", label: "Quinta-feira" },
  { value: "Sex", label: "Sexta-feira" },
  { value: "Sáb", label: "Sábado" },
  { value: "Dom", label: "Domingo" },
]

const OTHER = "__outro"

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
  patientType: "Primeira entrevista",
  status: "ativo" as PatientStatus,
  therapyStart: "",
  price: "",
  referral: "",
  referralOther: "",
  modality: "presencial" as PatientModality,
  notes: "",
}

function emptySchedule(): PatientSchedule {
  return { weekday: "Seg", time: "", duration: "50", modality: "" }
}

function currentMonthLabel() {
  const label = new Date().toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  })
  return label
    .replace(".", "")
    .replace(/^\w/, (char) => char.toUpperCase())
}

export function NewPatientDialog({
  open,
  onOpenChange,
  onCreate,
}: NewPatientDialogProps) {
  const [form, setForm] = useState(emptyForm)
  const [schedules, setSchedules] = useState<PatientSchedule[]>([])
  const [selectOpen, setSelectOpen] = useState(false)

  const canSubmit = form.name.trim() !== ""

  function handleSelectOpenChange(next: boolean) {
    if (next) {
      setSelectOpen(true)
      return
    }
    // Atrasa o reset: o mesmo clique que fecha o select não pode
    // ser interpretado como "clique fora" e fechar o modal junto.
    window.setTimeout(() => setSelectOpen(false), 100)
  }

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
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

  function handleOpenChange(next: boolean) {
    // Não deixa o modal fechar enquanto um select estiver aberto.
    if (!next && selectOpen) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    const first = schedules.find((row) => row.time !== "") ?? schedules[0]
    const sessionDay = first?.weekday ?? ""
    const sessionTime = first?.time ?? ""
    const nextSession =
      first && first.time ? `${first.weekday} · ${first.time}` : null

    const gender =
      form.gender === OTHER ? form.genderOther.trim() : form.gender
    const referral =
      form.referral === OTHER ? form.referralOther.trim() : form.referral

    onCreate({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      complaint: "—",
      approach: "—",
      modality: form.modality,
      price: form.price.trim(),
      status: form.status,
      sessionDay,
      sessionTime,
      nextSession,
      sessions: 0,
      since: currentMonthLabel(),
      birthDate: form.birthDate,
      gender,
      cep: form.cep.trim(),
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      contactRelation: form.contactRelation.trim(),
      patientType: form.patientType,
      therapyStart: form.therapyStart,
      referral,
      schedules,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto bg-[#FAF6EC] sm:max-w-2xl"
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
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
          <DialogDescription>
            Cadastre um novo paciente. Apenas o nome é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold">
              Dados pessoais
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col gap-2 sm:col-span-8">
                <Label htmlFor="patient-name">
                  Nome completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="patient-name"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Nome e sobrenome"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-birth">Data de nascimento</Label>
                <Input
                  id="patient-birth"
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => update("birthDate", event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-6">
                <Label htmlFor="patient-cpf">CPF</Label>
                <Input
                  id="patient-cpf"
                  value={form.cpf}
                  onChange={(event) => update("cpf", event.target.value)}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-6">
                <Label htmlFor="patient-gender">Gênero</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) => update("gender", value)}
                  onOpenChange={handleSelectOpenChange}
                >
                  <SelectTrigger id="patient-gender" className="w-full">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER}>Outro (especificar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.gender === OTHER ? (
                <div className="flex flex-col gap-2 sm:col-span-12">
                  <Label htmlFor="patient-gender-other">
                    Especifique o gênero
                  </Label>
                  <Input
                    id="patient-gender-other"
                    value={form.genderOther}
                    onChange={(event) =>
                      update("genderOther", event.target.value)
                    }
                    placeholder="Digite o gênero"
                  />
                </div>
              ) : null}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold">Endereço</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col gap-2 sm:col-span-3">
                <Label htmlFor="patient-cep">CEP</Label>
                <Input
                  id="patient-cep"
                  value={form.cep}
                  onChange={(event) => update("cep", event.target.value)}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-9">
                <Label htmlFor="patient-street">Rua / Logradouro</Label>
                <Input
                  id="patient-street"
                  value={form.street}
                  onChange={(event) => update("street", event.target.value)}
                  placeholder="Ex.: Rua das Flores"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="patient-number">Número</Label>
                <Input
                  id="patient-number"
                  value={form.number}
                  onChange={(event) => update("number", event.target.value)}
                  placeholder="123"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-complement">Complemento</Label>
                <Input
                  id="patient-complement"
                  value={form.complement}
                  onChange={(event) => update("complement", event.target.value)}
                  placeholder="Apto, bloco…"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-6">
                <Label htmlFor="patient-neighborhood">Bairro</Label>
                <Input
                  id="patient-neighborhood"
                  value={form.neighborhood}
                  onChange={(event) =>
                    update("neighborhood", event.target.value)
                  }
                  placeholder="Bairro"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-9">
                <Label htmlFor="patient-city">Cidade</Label>
                <Input
                  id="patient-city"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-3">
                <Label htmlFor="patient-state">UF</Label>
                <Input
                  id="patient-state"
                  value={form.state}
                  onChange={(event) =>
                    update(
                      "state",
                      event.target.value.toUpperCase().replace(/[^A-Z]/g, "")
                    )
                  }
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold">Contato</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-phone">Celular</Label>
                <Input
                  id="patient-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-8">
                <Label htmlFor="patient-email">E-mail</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-5">
                <Label htmlFor="patient-contact-name">
                  Contato próximo · Nome
                </Label>
                <Input
                  id="patient-contact-name"
                  value={form.contactName}
                  onChange={(event) =>
                    update("contactName", event.target.value)
                  }
                  placeholder="Nome do contato (opcional)"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-contact-phone">
                  Contato próximo · Telefone
                </Label>
                <Input
                  id="patient-contact-phone"
                  type="tel"
                  value={form.contactPhone}
                  onChange={(event) =>
                    update("contactPhone", event.target.value)
                  }
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-3">
                <Label htmlFor="patient-contact-relation">Relação</Label>
                <Input
                  id="patient-contact-relation"
                  value={form.contactRelation}
                  onChange={(event) =>
                    update("contactRelation", event.target.value)
                  }
                  placeholder="Mãe, irmão…"
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold">
              Informações da terapia
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col gap-2 sm:col-span-6">
                <Label htmlFor="patient-type">Tipo de paciente</Label>
                <Select
                  value={form.patientType}
                  onValueChange={(value) => update("patientType", value)}
                  onOpenChange={handleSelectOpenChange}
                >
                  <SelectTrigger id="patient-type" className="w-full">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-6">
                <Label htmlFor="patient-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    update("status", value as PatientStatus)
                  }
                  onOpenChange={handleSelectOpenChange}
                >
                  <SelectTrigger id="patient-status" className="w-full">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="em-pausa">Em pausa</SelectItem>
                    <SelectItem value="lista-espera">Lista de espera</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-therapy-start">
                  Data início da terapia
                </Label>
                <Input
                  id="patient-therapy-start"
                  type="date"
                  value={form.therapyStart}
                  onChange={(event) =>
                    update("therapyStart", event.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-price">Valor da sessão</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="patient-price"
                    value={form.price}
                    onChange={(event) => update("price", event.target.value)}
                    placeholder="0,00"
                    inputMode="decimal"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-4">
                <Label htmlFor="patient-referral">Indicação</Label>
                <Select
                  value={form.referral}
                  onValueChange={(value) => update("referral", value)}
                  onOpenChange={handleSelectOpenChange}
                >
                  <SelectTrigger id="patient-referral" className="w-full">
                    <SelectValue placeholder="Como chegou ao tratamento?" />
                  </SelectTrigger>
                  <SelectContent>
                    {referralOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER}>Outro (especificar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.referral === OTHER ? (
                <div className="flex flex-col gap-2 sm:col-span-12">
                  <Label htmlFor="patient-referral-other">
                    Especifique a indicação
                  </Label>
                  <Input
                    id="patient-referral-other"
                    value={form.referralOther}
                    onChange={(event) =>
                      update("referralOther", event.target.value)
                    }
                    placeholder="De onde veio a indicação?"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-2 sm:col-span-12">
                <Label htmlFor="patient-modality">
                  Modalidade de atendimento
                </Label>
                <Select
                  value={form.modality}
                  onValueChange={(value) =>
                    update("modality", value as PatientModality)
                  }
                  onOpenChange={handleSelectOpenChange}
                >
                  <SelectTrigger id="patient-modality" className="w-full">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Dias e horários de atendimento</Label>
              {schedules.length === 0 ? (
                <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
                  Nenhum horário cadastrado. Clique em "Adicionar horário" para
                  incluir um atendimento recorrente.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {schedules.map((row, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-xl border bg-card p-3"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Dia da semana
                          </Label>
                          <Select
                            value={row.weekday}
                            onValueChange={(value) =>
                              updateSchedule(index, "weekday", value)
                            }
                            onOpenChange={handleSelectOpenChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {weekdays.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Horário
                          </Label>
                          <Input
                            type="time"
                            value={row.time}
                            onChange={(event) =>
                              updateSchedule(index, "time", event.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Duração
                          </Label>
                          <Select
                            value={row.duration}
                            onValueChange={(value) =>
                              updateSchedule(index, "duration", value)
                            }
                            onOpenChange={handleSelectOpenChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((duration) => (
                                <SelectItem
                                  key={duration}
                                  value={String(duration)}
                                >
                                  {duration} min
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Modalidade
                          </Label>
                          <Select
                            value={row.modality}
                            onValueChange={(value) =>
                              updateSchedule(
                                index,
                                "modality",
                                value as PatientModality
                              )
                            }
                            onOpenChange={handleSelectOpenChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {modalityOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 self-end text-destructive hover:text-destructive"
                        onClick={() => removeSchedule(index)}
                      >
                        <Trash2 />
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={addSchedule}
              >
                <Plus />
                Adicionar horário
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="patient-notes">Observações</Label>
              <Textarea
                id="patient-notes"
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Anotações adicionais (opcional)"
                className="resize-none"
                rows={3}
              />
            </div>
          </section>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <UserPlus />
              Adicionar paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
