import { findPatient, mockPatients } from "@/data/patients"
import type { InboxEmail, Patient } from "@/data/types"
import type { TranslateFn } from "@/i18n/translate"
import type { Locale } from "@/lib/locale"

type BuildInboxEmailsCtx = {
  t: TranslateFn
  locale: Locale
}

type InboxEmailTemplate = {
  id: string
  patientId: string
  time: string
  read: boolean
  dateKey: "today" | "yesterday" | "days2" | "days3"
  labelKeys: string[]
  bodyLineCount: number
}

const EMAIL_TEMPLATES: InboxEmailTemplate[] = [
  {
    id: "1",
    patientId: "1",
    time: "08:12",
    read: false,
    dateKey: "today",
    labelKeys: ["patient", "session"],
    bodyLineCount: 3,
  },
  {
    id: "2",
    patientId: "3",
    time: "09:24",
    read: false,
    dateKey: "today",
    labelKeys: ["patient", "calendar"],
    bodyLineCount: 3,
  },
  {
    id: "3",
    patientId: "2",
    time: "07:45",
    read: false,
    dateKey: "today",
    labelKeys: ["financial"],
    bodyLineCount: 3,
  },
  {
    id: "4",
    patientId: "7",
    time: "21:10",
    read: true,
    dateKey: "yesterday",
    labelKeys: ["patient", "followUp"],
    bodyLineCount: 3,
  },
  {
    id: "5",
    patientId: "10",
    time: "18:47",
    read: true,
    dateKey: "yesterday",
    labelKeys: ["patient"],
    bodyLineCount: 3,
  },
  {
    id: "6",
    patientId: "11",
    time: "11:15",
    read: true,
    dateKey: "yesterday",
    labelKeys: ["waitlist"],
    bodyLineCount: 3,
  },
  {
    id: "7",
    patientId: "13",
    time: "16:30",
    read: true,
    dateKey: "days2",
    labelKeys: ["patient", "followUp"],
    bodyLineCount: 3,
  },
  {
    id: "8",
    patientId: "6",
    time: "14:05",
    read: true,
    dateKey: "days2",
    labelKeys: ["waitlist", "documents"],
    bodyLineCount: 3,
  },
  {
    id: "9",
    patientId: "21",
    time: "10:22",
    read: true,
    dateKey: "days3",
    labelKeys: ["patient"],
    bodyLineCount: 3,
  },
  {
    id: "10",
    patientId: "23",
    time: "09:18",
    read: true,
    dateKey: "days3",
    labelKeys: ["patient", "session"],
    bodyLineCount: 3,
  },
]

function buildEmailBody(t: TranslateFn, id: string, lineCount: number) {
  return Array.from({ length: lineCount }, (_, index) =>
    t(`demo.inbox.emails.${id}.body.${index}`)
  )
}

export function buildInboxEmails(
  patients: Patient[] = mockPatients,
  ctx: BuildInboxEmailsCtx
): InboxEmail[] {
  const { t } = ctx
  if (patients.length === 0) return []

  return EMAIL_TEMPLATES.flatMap((template) => {
    const patient = findPatient(patients, template.patientId)
    if (!patient) return []

    return [
      {
        id: template.id,
        patientId: patient.id,
        name: patient.name,
        email: patient.email,
        subject: t(`demo.inbox.emails.${template.id}.subject`),
        preview: t(`demo.inbox.emails.${template.id}.preview`),
        body: buildEmailBody(t, template.id, template.bodyLineCount),
        date: t(`demo.inbox.dates.${template.dateKey}`),
        time: template.time,
        read: template.read,
        labels: template.labelKeys.map((key) =>
          t(`demo.inbox.labels.${key}`)
        ),
      },
    ]
  })
}
