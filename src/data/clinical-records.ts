import type { Patient, SessionNote } from "@/data/types"

const noteTemplates: Record<
  string,
  Pick<SessionNote, "summary" | "evolution" | "plan" | "tags" | "mood">[]
> = {
  Ansiedade: [
    {
      summary:
        "Paciente relatou aumento de preocupações antecipatórias antes de reuniões no trabalho.",
      evolution:
        "Identificamos pensamentos automáticos de catastrofização. Trabalhamos reestruturação cognitiva com registro de evidências a favor e contra.",
      plan: "Diário de pensamentos 3x/semana. Praticar respiração diafragmática antes de reuniões.",
      tags: ["TCC", "Ansiedade"],
      mood: "Ansioso(a)",
    },
    {
      summary:
        "Retorno com redução parcial dos sintomas físicos (taquicardia e tensão muscular).",
      evolution:
        "Paciente conseguiu questionar duas crenças disfuncionais de forma autônoma. Mantém evitação leve em contextos sociais formais.",
      plan: "Exposição gradual: iniciar conversas breves em eventos de baixa pressão.",
      tags: ["Exposição", "Progresso"],
      mood: "Estável",
    },
    {
      summary:
        "Sessão focada em revisão das tarefas e celebração de pequenas vitórias da semana.",
      evolution:
        "Humor mais regulado. Relata sono mais reparador. Ainda apresenta ruminação noturna ocasional.",
      plan: "Manter rotina de desligamento digital 1h antes de dormir.",
      tags: ["Sono", "Autocuidado"],
      mood: "Melhor",
    },
  ],
  Depressão: [
    {
      summary:
        "Paciente descreveu humor deprimido persistente e perda de prazer em atividades antes prazerosas.",
      evolution:
        "Mapeamos ciclo inatividade-humor. Introduzimos ativação comportamental com metas mínimas diárias.",
      plan: "Agendar uma caminhada de 15 min, 3 dias na semana.",
      tags: ["Ativação", "Humor"],
      mood: "Baixo",
    },
    {
      summary: "Retomada gradual de hobbies. Relata mais energia pela manhã.",
      evolution:
        "Conseguiu cumprir 2 de 3 metas de ativação. Pensamentos de autocrítica ainda presentes, porém menos intensos.",
      plan: "Continuar registro de atividades prazerosas. Revisar autocompaixão.",
      tags: ["Progresso", "Autocompaixão"],
      mood: "Estável",
    },
  ],
  Burnout: [
    {
      summary:
        "Queixa central de exaustão emocional e cinismo em relação ao trabalho.",
      evolution:
        "Exploramos fatores de sobrecarga e dificuldade em estabelecer limites. Paciente reconhece padrão de hiperresponsabilidade.",
      plan: "Listar tarefas delegáveis. Definir um horário fixo para encerrar o expediente.",
      tags: ["Limites", "Trabalho"],
      mood: "Exausto(a)",
    },
  ],
  default: [
    {
      summary: "Sessão de acompanhamento com revisão da queixa principal e objetivos.",
      evolution:
        "Paciente demonstra engajamento no processo. Trabalhamos recursos de enfrentamento alinhados à abordagem terapêutica.",
      plan: "Manter reflexão semanal sobre gatilhos e estratégias utilizadas.",
      tags: ["Acompanhamento"],
      mood: "Estável",
    },
    {
      summary: "Retorno com foco em progressos e ajustes do plano terapêutico.",
      evolution:
        "Evolução consistente com os objetivos acordados. Alguns pontos de atenção mapeados para as próximas sessões.",
      plan: "Continuar práticas acordadas e registrar observações relevantes.",
      tags: ["Revisão"],
      mood: "Melhor",
    },
  ],
}

const detailedNotes: Record<string, Omit<SessionNote, "id" | "patientId">[]> = {
  "1": [
    {
      date: "10/03/2025",
      sessionNumber: 1,
      summary:
        "Primeira sessão. Mariana busca acolhimento por ansiedade generalizada intensificada após promoção no trabalho.",
      evolution:
        "Construímos vínculo terapêutico. Psicoeducação sobre o ciclo ansiedade-evitação. Queixa principal: medo de falhar em nova função.",
      plan: "Registro de situações gatilho. Observar sintomas físicos durante a semana.",
      tags: ["Entrevista inicial", "TCC", "Ansiedade"],
      mood: "Ansioso(a)",
      modality: "online",
    },
    {
      date: "17/03/2025",
      sessionNumber: 2,
      summary:
        "Relatou três episódios de taquicardia antes de apresentações. Evitou uma reunião por videoconferência.",
      evolution:
        "Identificamos pensamento central: 'Vão descobrir que não sou capaz'. Trabalhamos reestruturação com evidências concretas de desempenho.",
      plan: "Exercício de respiração 4-7-8. Registrar pensamentos automáticos no caderno.",
      tags: ["Pensamentos automáticos", "TCC"],
      mood: "Ansioso(a)",
      modality: "online",
    },
    {
      date: "07/04/2025",
      sessionNumber: 5,
      summary:
        "Participou de reunião importante sem cancelar. Sintomas físicos mais leves.",
      evolution:
        "Mariana aplicou técnica de respiração e questionou crença de incompetência. Relata maior autoconfiança em contextos profissionais.",
      plan: "Exposição gradual: voluntariar-se para falar em reuniões menores.",
      tags: ["Exposição", "Progresso"],
      mood: "Esperançoso(a)",
      modality: "online",
    },
    {
      date: "14/05/2025",
      sessionNumber: 9,
      summary:
        "Discussão sobre equilíbrio trabalho-vida pessoal e ruminação noturna.",
      evolution:
        "Padrão de checagem excessiva de e-mails identificado. Introduzimos rotina de desligamento e mindfulness breve antes de dormir.",
      plan: "Desligar notificações após 20h. Meditação guiada 5 min antes de dormir.",
      tags: ["Sono", "Mindfulness", "Trabalho"],
      mood: "Estável",
      modality: "online",
    },
    {
      date: "11/06/2025",
      sessionNumber: 14,
      summary:
        "Sessão de consolidação. Revisão dos objetivos iniciais e ganhos terapêuticos.",
      evolution:
        "Redução significativa de evitação. Mantém ansiedade situacional em apresentações grandes, mas com estratégias funcionais. Considera reduzir frequência futuramente.",
      plan: "Manter práticas de autocuidado. Retorno em 15 dias para avaliar manutenção.",
      tags: ["Consolidação", "Alta parcial"],
      mood: "Melhor",
      modality: "online",
    },
  ],
  "3": [
    {
      date: "12/09/2024",
      sessionNumber: 1,
      summary:
        "Camila inicia processo por dificuldades recorrentes em relacionamentos amorosos.",
      evolution:
        "Exploração de histórico vincular e padrões de idealização seguidos de decepção. Primeira aproximação psicanalítica ao tema.",
      plan: "Associação livre sobre relações significativas na infância e adolescência.",
      tags: ["Psicanálise", "Vínculo"],
      mood: "Reflexivo(a)",
      modality: "presencial",
    },
    {
      date: "15/01/2025",
      sessionNumber: 12,
      summary:
        "Traz material sobre término recente. Emotividade intensa, mas com maior elaboração que em situações anteriores.",
      evolution:
        "Consegue nomear necessidades próprias sem culpa excessiva. Insight sobre repetição de escolhas de parceiros emocionalmente indisponíveis.",
      plan: "Continuar elaboração do luto relacional. Observar impulsos de contato.",
      tags: ["Relacionamento", "Insight"],
      mood: "Triste",
      modality: "presencial",
    },
    {
      date: "10/06/2025",
      sessionNumber: 22,
      summary:
        "Relata novo interesse afetivo com abordagem mais consciente dos próprios limites.",
      evolution:
        "Demonstra maior capacidade de tolerar frustração e comunicar expectativas. Transferência trabalhada em sessão.",
      plan: "Observar ansiedade de abandono sem agir impulsivamente.",
      tags: ["Progresso", "Comunicação"],
      mood: "Esperançoso(a)",
      modality: "presencial",
    },
  ],
  "15": [
    {
      date: "06/11/2024",
      sessionNumber: 1,
      summary:
        "Elena inicia EMDR após acidente de trânsito com sintomas de reexperiência.",
      evolution:
        "Estabilização e psicoeducação sobre TEPT. Mapeamento de gatilhos sensoriais (buzinas, frenagens bruscas).",
      plan: "Técnicas de grounding. Place seguro para preparação ao processamento.",
      tags: ["EMDR", "TEPT", "Estabilização"],
      mood: "Hipervigilante",
      modality: "presencial",
    },
    {
      date: "22/01/2025",
      sessionNumber: 8,
      summary: "Início do processamento EMDR do evento traumático principal.",
      evolution:
        "Primeira fase de dessensibilização com redução parcial da carga emocional (SUD 8→5). Boa tolerância ao protocolo.",
      plan: "Continuar processamento na próxima sessão. Registrar sonhos e flashbacks.",
      tags: ["EMDR", "Processamento"],
      mood: "Emocional",
      modality: "hibrido",
    },
    {
      date: "14/05/2025",
      sessionNumber: 24,
      summary:
        "Sessão de fechamento de fase de processamento. Retorno gradual à direção após evitação prolongada.",
      evolution:
        "SUD residual em 2. Reexperiências raras e breves. Retomou atividades de lazer evitadas por meses.",
      plan: "Consolidar recursos de regulação. Reavaliar em 30 dias.",
      tags: ["EMDR", "Consolidação"],
      mood: "Estável",
      modality: "presencial",
    },
  ],
}

function parseSinceDate(since: string): Date {
  if (since === "—") return new Date()
  const [month, year] = since.split(" ")
  const months: Record<string, number> = {
    Jan: 0,
    Fev: 1,
    Mar: 2,
    Abr: 3,
    Mai: 4,
    Jun: 5,
    Jul: 6,
    Ago: 7,
    Set: 8,
    Out: 9,
    Nov: 10,
    Dez: 11,
  }
  return new Date(Number(year), months[month] ?? 0, 15)
}

function formatNoteDate(date: Date): string {
  return date.toLocaleDateString("pt-BR")
}

function getTemplates(complaint: string) {
  for (const key of Object.keys(noteTemplates)) {
    if (key !== "default" && complaint.toLowerCase().includes(key.toLowerCase())) {
      return noteTemplates[key]
    }
  }
  return noteTemplates.default
}

function generateNotesForPatient(patient: Patient): SessionNote[] {
  if (patient.sessions === 0) {
    if (patient.status === "lista-espera") {
      return [
        {
          id: `note-${patient.id}-0`,
          patientId: patient.id,
          date: formatNoteDate(new Date()),
          sessionNumber: 0,
          summary: "Paciente em lista de espera. Contato inicial registrado.",
          evolution:
            "Aguardando vaga para primeira entrevista. Dados de contato e queixa principal confirmados no cadastro.",
          plan: "Agendar entrevista inicial assim que houver disponibilidade na agenda.",
          tags: ["Lista de espera"],
          mood: "—",
        },
      ]
    }
    return []
  }

  const templates = getTemplates(patient.complaint)
  const count = Math.min(Math.max(2, Math.ceil(patient.sessions / 3)), 6)
  const start = parseSinceDate(patient.since)
  const notes: SessionNote[] = []

  for (let index = 0; index < count; index++) {
    const template = templates[index % templates.length]
    const noteDate = new Date(start)
    noteDate.setDate(noteDate.getDate() + index * 14)
    const sessionNumber = Math.min(
      patient.sessions,
      Math.ceil(((index + 1) / count) * patient.sessions)
    )

    notes.push({
      id: `note-${patient.id}-${index}`,
      patientId: patient.id,
      date: formatNoteDate(noteDate),
      sessionNumber,
      summary: template.summary,
      evolution: template.evolution,
      plan: template.plan,
      tags: [...(template.tags ?? []), patient.approach].filter(Boolean),
      mood: template.mood,
      modality: patient.modality === "hibrido" ? "online" : patient.modality,
    })
  }

  return notes
}

export function buildClinicalRecords(patients: Patient[]): SessionNote[] {
  const records: SessionNote[] = []

  for (const patient of patients) {
    const custom = detailedNotes[patient.id]
    if (custom) {
      records.push(
        ...custom.map((note, index) => ({
          ...note,
          id: `note-${patient.id}-${index}`,
          patientId: patient.id,
        }))
      )
    } else {
      records.push(...generateNotesForPatient(patient))
    }
  }

  return records.sort(
    (a, b) =>
      parseBrDate(b.date).getTime() - parseBrDate(a.date).getTime()
  )
}

function parseBrDate(value: string): Date {
  const [day, month, year] = value.split("/").map(Number)
  return new Date(year, month - 1, day)
}

export function getRecordsForPatient(
  records: SessionNote[],
  patientId: string
) {
  return records
    .filter((note) => note.patientId === patientId)
    .sort(
      (a, b) =>
        parseBrDate(b.date).getTime() - parseBrDate(a.date).getTime()
    )
}

export function getLatestRecord(
  records: SessionNote[],
  patientId: string
): SessionNote | undefined {
  return getRecordsForPatient(records, patientId)[0]
}
