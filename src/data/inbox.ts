import { findPatient, mockPatients } from "@/data/patients"
import type { InboxEmail, Patient } from "@/data/types"

export function buildInboxEmails(patients: Patient[] = mockPatients): InboxEmail[] {
  const mariana = findPatient(patients, "1")!
  const rafael = findPatient(patients, "2")!
  const camila = findPatient(patients, "3")!
  const juliana = findPatient(patients, "7")!
  const gustavo = findPatient(patients, "10")!
  const fernanda = findPatient(patients, "11")!
  const carolina = findPatient(patients, "13")!
  const pedro = findPatient(patients, "6")!
  const leonardo = findPatient(patients, "21")!
  const nora = findPatient(patients, "23")!

  return [
    {
      id: "1",
      patientId: mariana.id,
      name: mariana.name,
      email: mariana.email,
      subject: "Confirmação da sessão de quarta",
      preview:
        "Oi! Só confirmando nossa sessão de quarta às 09h. Estarei online pelo link de sempre.",
      body: [
        "Oi! Só confirmando nossa sessão de quarta às 09h. Estarei online pelo link de sempre.",
        "Se precisar de algo antes, me avise por aqui.",
        "Abraços,\nMariana",
      ],
      date: "Hoje",
      time: "08:12",
      read: false,
      labels: ["Paciente", "Sessão"],
    },
    {
      id: "2",
      patientId: camila.id,
      name: camila.name,
      email: camila.email,
      subject: "Remarcação da sessão de quinta",
      preview:
        "Consigo remarcar a sessão de quinta para 15h? Surgiu um compromisso no trabalho.",
      body: [
        "Olá! Consigo remarcar a sessão de quinta para 15h? Surgiu um compromisso no trabalho.",
        "Se não der, mantenho o horário das 14h30 mesmo.",
        "Obrigada,\nCamila",
      ],
      date: "Hoje",
      time: "09:24",
      read: false,
      labels: ["Paciente", "Agenda"],
    },
    {
      id: "3",
      patientId: rafael.id,
      name: rafael.name,
      email: rafael.email,
      subject: "Comprovante de pagamento",
      preview:
        "Segue o comprovante da sessão desta semana. Qualquer divergência, me avise.",
      body: [
        "Bom dia! Segue o comprovante da sessão desta semana.",
        "Qualquer divergência, me avise.",
        "Rafael",
      ],
      date: "Hoje",
      time: "07:45",
      read: false,
      labels: ["Financeiro"],
    },
    {
      id: "4",
      patientId: juliana.id,
      name: juliana.name,
      email: juliana.email,
      subject: "Relato após exercício de respiração",
      preview:
        "Tentei o exercício que combinamos e senti menos tensão antes de dormir.",
      body: [
        "Oi! Tentei o exercício que combinamos e senti menos tensão antes de dormir.",
        "Posso te contar com mais detalhes na sessão de sexta?",
        "Juliana",
      ],
      date: "Ontem",
      time: "21:10",
      read: true,
      labels: ["Paciente", "Acompanhamento"],
    },
    {
      id: "5",
      patientId: gustavo.id,
      name: gustavo.name,
      email: gustavo.email,
      subject: "Dúvida sobre tarefa de exposição",
      preview:
        "Fiquei em dúvida sobre a escala de ansiedade na tarefa da semana.",
      body: [
        "Olá! Fiquei em dúvida sobre a escala de ansiedade na tarefa da semana.",
        "Devo registrar antes e depois de cada exposição?",
        "Gustavo",
      ],
      date: "Ontem",
      time: "18:47",
      read: true,
      labels: ["Paciente"],
    },
    {
      id: "6",
      patientId: fernanda.id,
      name: fernanda.name,
      email: fernanda.email,
      subject: "Disponibilidade para avaliação inicial",
      preview:
        "Gostaria de saber se há vaga para avaliação inicial nas quintas à tarde.",
      body: [
        "Olá! Gostaria de saber se há vaga para avaliação inicial nas quintas à tarde.",
        "Posso começar ainda neste mês, se houver horário.",
        "Fernanda",
      ],
      date: "Ontem",
      time: "11:15",
      read: true,
      labels: ["Lista de espera"],
    },
    {
      id: "7",
      patientId: carolina.id,
      name: carolina.name,
      email: carolina.email,
      subject: "Relato de sono na última semana",
      preview:
        "Dormi melhor em 4 das 7 noites depois de ajustar a rotina noturna.",
      body: [
        "Oi! Dormi melhor em 4 das 7 noites depois de ajustar a rotina noturna.",
        "Anotei os horários no diário que você sugeriu.",
        "Carolina",
      ],
      date: "2 dias",
      time: "16:30",
      read: true,
      labels: ["Paciente", "Acompanhamento"],
    },
    {
      id: "8",
      patientId: pedro.id,
      name: pedro.name,
      email: pedro.email,
      subject: "Documentos para avaliação inicial",
      preview:
        "Envio em anexo o formulário preenchido e a autorização assinada.",
      body: [
        "Boa tarde! Envio em anexo o formulário preenchido e a autorização assinada.",
        "Aguardo confirmação da avaliação inicial de segunda.",
        "Pedro",
      ],
      date: "2 dias",
      time: "14:05",
      read: true,
      labels: ["Lista de espera", "Documentos"],
    },
    {
      id: "9",
      patientId: leonardo.id,
      name: leonardo.name,
      email: leonardo.email,
      subject: "Feedback sobre sessão de ontem",
      preview:
        "A conversa sobre autocrítica no trabalho me ajudou a enxergar padrões.",
      body: [
        "Olá! A conversa sobre autocrítica no trabalho me ajudou a enxergar padrões.",
        "Queria registrar isso antes da próxima sessão.",
        "Leonardo",
      ],
      date: "3 dias",
      time: "10:22",
      read: true,
      labels: ["Paciente"],
    },
    {
      id: "10",
      patientId: nora.id,
      name: nora.name,
      email: nora.email,
      subject: "Primeira sessão — dúvidas logísticas",
      preview:
        "Confirmando se a sessão de sexta será online e qual plataforma usamos.",
      body: [
        "Oi! Confirmando se a sessão de sexta será online e qual plataforma usamos.",
        "É minha primeira sessão e quero chegar preparada.",
        "Nora",
      ],
      date: "3 dias",
      time: "09:18",
      read: true,
      labels: ["Paciente", "Sessão"],
    },
  ]
}
