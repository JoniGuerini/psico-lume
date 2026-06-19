import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Inbox,
  Mail,
  UserRound,
} from "lucide-react"

import { findPatient, minutesAgo, mockPatients } from "@/data/patients"
import type { Notification, Patient } from "@/data/types"

function formatShortDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
}

function sessionDayLabel(daysAgo: number) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return formatShortDate(date)
}

export function buildNotifications(
  patients: Patient[] = mockPatients
): Notification[] {
  const gustavo = findPatient(patients, "10")
  const camila = findPatient(patients, "3")
  const rafael = findPatient(patients, "2")
  const thiago = findPatient(patients, "4")
  const beatriz = findPatient(patients, "9")
  const fernanda = findPatient(patients, "11")

  const notifications: Notification[] = []

  if (gustavo) {
    notifications.push({
      id: "1",
      icon: AlertCircle,
      category: "sessao",
      title: `Status pendente — ${gustavo.name}`,
      description: `A sessão de ${sessionDayLabel(2)} às ${gustavo.sessionTime} passou e ainda está como Agendada.`,
      date: minutesAgo(18),
      read: false,
    })
  }

  if (camila) {
    notifications.push({
      id: "2",
      icon: AlertCircle,
      category: "sessao",
      title: `Status pendente — ${camila.name}`,
      description: `A sessão de ${sessionDayLabel(1)} às ${camila.sessionTime} passou sem comparecimento registrado.`,
      date: minutesAgo(95),
      read: false,
    })
  }

  if (rafael) {
    notifications.push({
      id: "3",
      icon: CalendarClock,
      category: "sessao",
      title: `Atendimento hoje — ${rafael.name}`,
      description: `Sessão às ${rafael.sessionTime}. Marque o status após o atendimento.`,
      date: minutesAgo(210),
      read: false,
    })
  }

  if (thiago) {
    notifications.push({
      id: "4",
      icon: CreditCard,
      category: "financeiro",
      title: `Inadimplência — ${thiago.name}`,
      description:
        "Pagamento em aberto no cadastro. Atualize o financeiro após o contato com o paciente.",
      date: minutesAgo(60 * 4),
      read: false,
    })
  }

  if (beatriz) {
    notifications.push({
      id: "5",
      icon: ClipboardList,
      category: "sessao",
      title: `Evolução pendente — ${beatriz.name}`,
      description:
        "Sessão marcada como realizada ontem, mas ainda sem registro no prontuário.",
      date: minutesAgo(60 * 26),
      read: true,
    })
  }

  notifications.push({
    id: "6",
    icon: AlertCircle,
    category: "sessao",
    title: "3 sessões da semana sem fechamento",
    description:
      "Atualize o status de comparecimento na agenda para manter o histórico em dia.",
    date: minutesAgo(60 * 28),
    read: true,
  })

  if (fernanda) {
    notifications.push({
      id: "7",
      icon: UserRound,
      category: "paciente",
      title: `Lista de espera — ${fernanda.name}`,
      description:
        "Paciente aguardando vaga há 2 semanas. Considere agendar a entrevista inicial.",
      date: minutesAgo(60 * 40),
      read: true,
    })
  }

  if (thiago) {
    notifications.push({
      id: "8",
      icon: UserRound,
      category: "paciente",
      title: `Paciente em pausa — ${thiago.name}`,
      description:
        "Em pausa no cadastro. Avalie retorno, encerramento ou manutenção do status.",
      date: minutesAgo(60 * 52),
      read: true,
    })
  }

  notifications.push({
    id: "9",
    icon: CreditCard,
    category: "financeiro",
    title: "Conciliação da semana",
    description:
      "Há sessões realizadas esta semana que ainda não refletem no resumo financeiro.",
    date: minutesAgo(60 * 68),
    read: true,
  })

  notifications.push({
    id: "10",
    icon: Inbox,
    category: "mensagem",
    title: "Inbox — 2 e-mails não lidos",
    description: "Dois e-mails aguardando leitura na caixa de entrada.",
    date: minutesAgo(60 * 80),
    read: true,
  })

  notifications.push({
    id: "11",
    icon: Mail,
    category: "sistema",
    title: "Resumo semanal disponível",
    description:
      "Panorama de atendimentos, pendências de status e alertas financeiros da semana.",
    date: minutesAgo(60 * 96),
    read: true,
  })

  return notifications
}
