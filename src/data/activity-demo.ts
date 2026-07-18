import type { Patient } from "@/data/types"
import {
  activitySummaryKey,
  type ActivityAction,
  type ActivityCategory,
  type ActivityEntry,
} from "@/lib/activity-log"

function hoursAgo(hours: number, from = new Date()) {
  return new Date(from.getTime() - hours * 60 * 60 * 1000)
}

function daysAgo(days: number, hour = 10, minute = 0, from = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date
}

function formatWhen(date: Date) {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function entry(
  id: string,
  at: Date,
  action: ActivityAction,
  category: ActivityCategory,
  params: Record<string, string | number>,
  links?: Pick<
    ActivityEntry,
    "patientId" | "eventId" | "eventDateTimestamp" | "noteId"
  >
): ActivityEntry {
  return {
    id,
    at: at.toISOString(),
    action,
    category,
    summaryKey: activitySummaryKey(action),
    params,
    ...links,
  }
}

/** Base densa de atividade só para o modo demo (login sem convidado). */
export function buildDemoActivityLog(patients: Patient[]): ActivityEntry[] {
  const pick = (index: number) => patients[index % patients.length]
  const now = new Date()
  const items: ActivityEntry[] = []
  let seq = 0
  const nextId = () => `demo-act-${++seq}`

  const sessionDay = (offsetDays: number, hour: number, minute = 0) => {
    const date = daysAgo(offsetDays, hour, minute, now)
    return { date, when: formatWhen(date), ts: date.getTime() }
  }

  // ——— Hoje ———
  {
    const p = pick(0)
    items.push(
      entry(
        nextId(),
        hoursAgo(0.1, now),
        "session.status_changed",
        "session",
        {
          patientName: p.name,
          fromStatus: "Agendada",
          toStatus: "Realizada",
        },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-today`,
          eventDateTimestamp: sessionDay(0, 9).ts,
        }
      )
    )
  }
  {
    const p = pick(1)
    const s = sessionDay(0, 11)
    items.push(
      entry(
        nextId(),
        hoursAgo(0.4, now),
        "session.created",
        "session",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-created`,
          eventDateTimestamp: s.ts,
        }
      )
    )
  }
  {
    const p = pick(2)
    items.push(
      entry(
        nextId(),
        hoursAgo(1, now),
        "record.created",
        "record",
        { patientName: p.name },
        { patientId: p.id, noteId: `demo-note-${p.id}-1` }
      )
    )
  }
  {
    const p = pick(3)
    const s = sessionDay(0, 14, 30)
    items.push(
      entry(
        nextId(),
        hoursAgo(1.5, now),
        "payment.marked_paid",
        "payment",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-paid`,
          eventDateTimestamp: s.ts,
        }
      )
    )
  }
  {
    const p = pick(4)
    items.push(
      entry(
        nextId(),
        hoursAgo(2, now),
        "patient.updated",
        "patient",
        { patientName: p.name },
        { patientId: p.id }
      )
    )
  }
  {
    const p = pick(5)
    const s = sessionDay(1, 10)
    items.push(
      entry(
        nextId(),
        hoursAgo(3, now),
        "session.rescheduled",
        "session",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-resched`,
          eventDateTimestamp: s.ts,
        }
      )
    )
  }
  {
    const p = pick(3)
    const s = sessionDay(0, 15)
    items.push(
      entry(
        nextId(),
        hoursAgo(3.5, now),
        "payment.marked_paid",
        "payment",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-paid-b`,
          eventDateTimestamp: s.ts,
        }
      )
    )
  }
  {
    const p = pick(6)
    items.push(
      entry(
        nextId(),
        hoursAgo(5, now),
        "record.updated",
        "record",
        { patientName: p.name },
        { patientId: p.id, noteId: `demo-note-${p.id}-2` }
      )
    )
  }

  // ——— Ontem ———
  {
    const p = pick(7)
    items.push(
      entry(
        nextId(),
        daysAgo(1, 18, 20, now),
        "session.status_changed",
        "session",
        {
          patientName: p.name,
          fromStatus: "Agendada",
          toStatus: "Faltou",
        },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-missed`,
          eventDateTimestamp: sessionDay(1, 16).ts,
        }
      )
    )
  }
  {
    const p = pick(8)
    const s = sessionDay(1, 15)
    items.push(
      entry(
        nextId(),
        daysAgo(1, 16, 10, now),
        "session.updated",
        "session",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-upd`,
          eventDateTimestamp: s.ts,
        }
      )
    )
  }
  {
    const p = pick(9)
    items.push(
      entry(
        nextId(),
        daysAgo(1, 14, 5, now),
        "patient.created",
        "patient",
        { patientName: p.name },
        { patientId: p.id }
      )
    )
  }
  {
    const p = pick(10)
    const s = sessionDay(1, 9, 30)
    items.push(
      entry(
        nextId(),
        daysAgo(1, 12, 40, now),
        "payment.marked_unpaid",
        "payment",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-unpaid`,
          eventDateTimestamp: s.ts,
        }
      )
    )
  }
  {
    const p = pick(11)
    items.push(
      entry(
        nextId(),
        daysAgo(1, 11, 0, now),
        "record.created",
        "record",
        { patientName: p.name },
        { patientId: p.id, noteId: `demo-note-${p.id}-3` }
      )
    )
  }
  {
    const p = pick(12)
    items.push(
      entry(
        nextId(),
        daysAgo(1, 9, 15, now),
        "payment.overdue_manual_on",
        "payment",
        { patientName: p.name },
        { patientId: p.id }
      )
    )
  }

  // ——— Esta semana ———
  for (let day = 2; day <= 5; day++) {
    const p = pick(day + 3)
    const s = sessionDay(day, 10 + (day % 3), 15 * (day % 4))
    items.push(
      entry(
        nextId(),
        daysAgo(day, 17, 30, now),
        "session.status_changed",
        "session",
        {
          patientName: p.name,
          fromStatus: "Agendada",
          toStatus: day % 2 === 0 ? "Realizada" : "Cancelada",
        },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-w${day}`,
          eventDateTimestamp: s.ts,
        }
      )
    )
    items.push(
      entry(
        nextId(),
        daysAgo(day, 15, 10, now),
        "record.created",
        "record",
        { patientName: p.name },
        { patientId: p.id, noteId: `demo-note-${p.id}-w${day}` }
      )
    )
    if (day % 2 === 0) {
      items.push(
        entry(
          nextId(),
          daysAgo(day, 13, 0, now),
          "payment.marked_paid",
          "payment",
          { patientName: p.name, when: s.when },
          {
            patientId: p.id,
            eventId: `demo-ev-${p.id}-wp${day}`,
            eventDateTimestamp: s.ts,
          }
        )
      )
    } else {
      const s2 = sessionDay(day - 1, 11)
      items.push(
        entry(
          nextId(),
          daysAgo(day, 12, 20, now),
          "session.rescheduled",
          "session",
          { patientName: p.name, when: s2.when },
          {
            patientId: p.id,
            eventId: `demo-ev-${p.id}-wr${day}`,
            eventDateTimestamp: s2.ts,
          }
        )
      )
    }
    items.push(
      entry(
        nextId(),
        daysAgo(day, 10, 5, now),
        "patient.updated",
        "patient",
        { patientName: p.name },
        { patientId: p.id }
      )
    )
  }

  // ——— Mais antigas ———
  for (let day = 8; day <= 21; day += 2) {
    const p = pick(day)
    const s = sessionDay(day, 9 + (day % 5), 0)
    items.push(
      entry(
        nextId(),
        daysAgo(day, 16, 0, now),
        "session.created",
        "session",
        { patientName: p.name, when: s.when },
        {
          patientId: p.id,
          eventId: `demo-ev-${p.id}-old${day}`,
          eventDateTimestamp: s.ts,
        }
      )
    )
    items.push(
      entry(
        nextId(),
        daysAgo(day, 14, 30, now),
        day % 4 === 0 ? "record.deleted" : "record.updated",
        "record",
        { patientName: p.name },
        { patientId: p.id, noteId: `demo-note-${p.id}-old${day}` }
      )
    )
    if (day % 3 === 0) {
      items.push(
        entry(
          nextId(),
          daysAgo(day, 11, 0, now),
          "payment.overdue_manual_off",
          "payment",
          { patientName: p.name },
          { patientId: p.id }
        )
      )
    }
    if (day % 5 === 0) {
      items.push(
        entry(
          nextId(),
          daysAgo(day, 9, 40, now),
          "session.deleted",
          "session",
          { patientName: p.name, when: s.when },
          {
            patientId: p.id,
            eventId: `demo-ev-${p.id}-del${day}`,
            eventDateTimestamp: s.ts,
          }
        )
      )
    }
    if (day === 14) {
      items.push(
        entry(
          nextId(),
          daysAgo(day, 8, 0, now),
          "payment.overdue_manual_auto",
          "payment",
          { patientName: p.name },
          { patientId: p.id }
        )
      )
    }
  }

  {
    const p = pick(0)
    items.push(
      entry(
        nextId(),
        daysAgo(25, 12, 0, now),
        "patient.created",
        "patient",
        { patientName: p.name },
        { patientId: p.id }
      )
    )
  }

  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}
