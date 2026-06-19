import {
  CalendarClock,
  CalendarX,
  CreditCard,
  MessageSquare,
  UserPlus,
} from "lucide-react"

import {
  findPatient,
  getTodaysAppointments,
  minutesAgo,
  mockPatients,
} from "@/data/patients"
import type { Notification, Patient } from "@/data/types"

export function buildNotifications(patients: Patient[] = mockPatients): Notification[] {
  const todaySessions = getTodaysAppointments(patients)
  const firstToday = todaySessions[0]
  const camila = findPatient(patients, "3")
  const rafael = findPatient(patients, "2")
  const fernanda = findPatient(patients, "11")
  const beatriz = findPatient(patients, "9")
  const thiago = findPatient(patients, "4")
  const pedro = findPatient(patients, "6")
  const karina = findPatient(patients, "20")
  const tatiana = findPatient(patients, "28")

  const notifications: Notification[] = []

  if (firstToday) {
    notifications.push({
      id: "1",
      icon: CalendarClock,
      category: "sessao",
      title: `${firstToday.name} confirmou a sessão`,
      description: `Sessão de hoje às ${firstToday.sessionTime} confirmada.`,
      date: minutesAgo(5),
      read: false,
    })
  }

  if (fernanda) {
    notifications.push({
      id: "2",
      icon: UserPlus,
      category: "paciente",
      title: "Novo paciente na lista de espera",
      description: `${fernanda.name} entrou na sua lista de espera.`,
      date: minutesAgo(64),
      read: false,
    })
  }

  if (rafael) {
    notifications.push({
      id: "3",
      icon: CreditCard,
      category: "financeiro",
      title: "Pagamento recebido",
      description: `${rafael.name} pagou R$ ${rafael.price} referente à sessão.`,
      date: minutesAgo(182),
      read: false,
    })
  }

  if (camila) {
    notifications.push({
      id: "4",
      icon: MessageSquare,
      category: "mensagem",
      title: `Mensagem de ${camila.name}`,
      description: "“Consigo remarcar a sessão de quinta para 15h?”",
      date: minutesAgo(300),
      read: false,
    })
  }

  const afternoonSession = todaySessions.find((session) =>
    session.sessionTime >= "14:00"
  )

  if (afternoonSession) {
    notifications.push({
      id: "5",
      icon: CalendarClock,
      category: "sessao",
      title: "Lembrete de sessão",
      description: `Sessão com ${afternoonSession.name} hoje às ${afternoonSession.sessionTime}.`,
      date: minutesAgo(60 * 22),
      read: true,
    })
  }

  if (beatriz) {
    notifications.push({
      id: "6",
      icon: CreditCard,
      category: "financeiro",
      title: "Pagamento em atraso",
      description: `O pagamento de ${beatriz.name} está atrasado há 3 dias.`,
      date: minutesAgo(60 * 26),
      read: true,
    })
  }

  if (thiago) {
    notifications.push({
      id: "7",
      icon: CalendarX,
      category: "sessao",
      title: `${thiago.name} cancelou a sessão`,
      description: "A sessão de segunda às 10:00 foi cancelada.",
      date: minutesAgo(60 * 49),
      read: true,
    })
  }

  if (pedro) {
    notifications.push({
      id: "8",
      icon: UserPlus,
      category: "paciente",
      title: "Primeira avaliação agendada",
      description: `${pedro.name} agendou a avaliação inicial para segunda.`,
      date: minutesAgo(60 * 96),
      read: true,
    })
  }

  if (karina) {
    notifications.push({
      id: "9",
      icon: MessageSquare,
      category: "mensagem",
      title: `Mensagem de ${karina.name}`,
      description: "“Preciso reagendar a sessão da próxima semana.”",
      date: minutesAgo(60 * 30),
      read: false,
    })
  }

  if (tatiana) {
    notifications.push({
      id: "10",
      icon: UserPlus,
      category: "paciente",
      title: "Interesse na lista de espera",
      description: `${tatiana.name} solicitou vaga para terças à tarde.`,
      date: minutesAgo(60 * 72),
      read: true,
    })
  }

  return notifications
}
