import { useMemo, useState } from "react"
import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  History,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import {
  activityNavigatesToPatient,
  activityNavigatesToSession,
  type ActivityCategory,
  type ActivityEntry,
} from "@/lib/activity-log"
import { formatRelativeTimeLabel } from "@/lib/i18n-helpers"
import { cn } from "@/lib/utils"

type Filter = "all" | ActivityCategory

const filterConfig: {
  value: Filter
  labelKey:
    | "activity.filters.all"
    | "activity.filters.patients"
    | "activity.filters.sessions"
    | "activity.filters.records"
    | "activity.filters.payments"
}[] = [
  { value: "all", labelKey: "activity.filters.all" },
  { value: "patient", labelKey: "activity.filters.patients" },
  { value: "session", labelKey: "activity.filters.sessions" },
  { value: "record", labelKey: "activity.filters.records" },
  { value: "payment", labelKey: "activity.filters.payments" },
]

const categoryIcon = {
  patient: UserRound,
  session: CalendarClock,
  record: ClipboardList,
  payment: CreditCard,
} as const

type TimeGroupKey = "today" | "yesterday" | "thisWeek" | "older"

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function groupKey(date: Date): TimeGroupKey {
  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(date).getTime()) /
      86_400_000
  )

  if (diffDays <= 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return "thisWeek"
  return "older"
}

const groupOrder: TimeGroupKey[] = [
  "today",
  "yesterday",
  "thisWeek",
  "older",
]

const groupLabelKey: Record<TimeGroupKey, string> = {
  today: "common.today",
  yesterday: "common.yesterday",
  thisWeek: "common.thisWeek",
  older: "common.older",
}

function ActivitySummaryText({
  summaryKey,
  params,
}: {
  summaryKey: string
  params: Record<string, string | number>
}) {
  const { t } = useTranslation()
  const template = t(summaryKey)
  const parts = template.split(/(\{\{\w+\}\})/g).filter((part) => part.length > 0)

  return (
    <p className="text-sm leading-snug text-muted-foreground">
      {parts.map((part, index) => {
        const match = /^\{\{(\w+)\}\}$/.exec(part)
        if (!match) {
          return <span key={`${part}-${index}`}>{part}</span>
        }
        const value = params[match[1]]
        if (value == null) {
          return <span key={`${part}-${index}`}>{part}</span>
        }
        return (
          <span
            key={`${match[1]}-${index}`}
            className="font-semibold text-foreground"
          >
            {value}
          </span>
        )
      })}
    </p>
  )
}

export function ActivityPage({
  onOpenPatient,
  onOpenAgendaDay,
}: {
  onOpenPatient?: (patientId: string) => void
  onOpenAgendaDay?: (date: Date) => void
}) {
  const { t, locale } = useTranslation()
  const { activity } = useClinicData()
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return activity.filter((item) => {
      if (filter !== "all" && item.category !== filter) return false
      if (!normalized) return true

      const summary = t(item.summaryKey, item.params).toLowerCase()
      const category = t(`activity.categories.${item.category}`).toLowerCase()
      const paramHaystack = Object.values(item.params)
        .map((value) => String(value).toLowerCase())
        .join(" ")

      return (
        summary.includes(normalized) ||
        category.includes(normalized) ||
        paramHaystack.includes(normalized)
      )
    })
  }, [activity, filter, query, t])

  const groups = useMemo(() => {
    const map = new Map<TimeGroupKey, ActivityEntry[]>()
    for (const key of groupOrder) map.set(key, [])
    for (const item of filtered) {
      const key = groupKey(new Date(item.at))
      map.get(key)!.push(item)
    }
    return groupOrder
      .map((key) => ({ key, items: map.get(key)! }))
      .filter((group) => group.items.length > 0)
  }, [filtered])

  const emptyKind =
    activity.length === 0
      ? "none"
      : query.trim()
        ? "search"
        : filter !== "all"
          ? "filter"
          : "none"

  function handleOpen(entry: ActivityEntry) {
    if (activityNavigatesToSession(entry) && entry.eventDateTimestamp != null) {
      onOpenAgendaDay?.(new Date(entry.eventDateTimestamp))
      return
    }
    if (activityNavigatesToPatient(entry) && entry.patientId) {
      onOpenPatient?.(entry.patientId)
    }
  }

  function isClickable(entry: ActivityEntry) {
    if (activityNavigatesToSession(entry) && onOpenAgendaDay) return true
    if (activityNavigatesToPatient(entry) && onOpenPatient) return true
    return false
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <Card className="flex shrink-0 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">
            {t("activity.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("activity.subtitle")}
          </p>
        </div>

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("activity.searchPlaceholder")}
          className="border-0 bg-muted hover:bg-muted/80"
        />

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <TabsList className="flex-wrap border border-border bg-background/40">
            {filterConfig.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {t(item.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      <div className="flex min-h-0 w-full flex-1 flex-col">
        {filtered.length === 0 ? (
          <Card className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/40">
              <History className="size-5 text-muted-foreground" />
            </div>
            <div className="flex max-w-sm flex-col gap-1">
              <p className="font-medium">
                {emptyKind === "search"
                  ? t("activity.empty.searchTitle")
                  : t("activity.empty.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {emptyKind === "search"
                  ? t("activity.empty.search")
                  : emptyKind === "filter"
                    ? t("activity.empty.filter")
                    : t("activity.empty.description")}
              </p>
            </div>
          </Card>
        ) : (
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="flex flex-col gap-6 pr-1 pb-1">
              {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t(groupLabelKey[group.key])}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {group.items.map((entry) => {
                      const Icon = categoryIcon[entry.category]
                      const clickable = isClickable(entry)
                      return (
                        <li key={entry.id}>
                          <Card
                            size="sm"
                            className={cn(
                              "p-0",
                              clickable &&
                                "transition-colors hover:bg-accent/50"
                            )}
                          >
                            <button
                              type="button"
                              disabled={!clickable}
                              onClick={() => handleOpen(entry)}
                              className={cn(
                                "flex w-full items-start gap-3 p-3 text-left",
                                !clickable && "cursor-default"
                              )}
                            >
                              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                                <Icon className="size-4 text-muted-foreground" />
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <ActivitySummaryText
                                  summaryKey={entry.summaryKey}
                                  params={entry.params}
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="font-normal"
                                  >
                                    {t(
                                      `activity.categories.${entry.category}`
                                    )}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeTimeLabel(
                                      new Date(entry.at),
                                      locale
                                    )}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </Card>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
