import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Map,
  Rocket,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getRoadmapByStatus,
  ROADMAP_META,
  roadmapItems,
  statusConfig,
  type RoadmapItem,
  type RoadmapStatus,
} from "@/data/roadmap"
import { useTranslation } from "@/context/locale-provider"
import { cn } from "@/lib/utils"
import type { TranslateFn } from "@/i18n/translate"

function translatedOrFallback(t: TranslateFn, key: string, fallback: string) {
  const value = t(key)
  return value === key ? fallback : value
}

const TAG_SLUGS: Record<string, string> = {
  UI: "ui",
  Tema: "theme",
  Dados: "data",
  Painel: "dashboard",
  Pacientes: "patients",
  Agenda: "calendar",
  Financeiro: "finance",
  Comunicação: "communication",
  Notificações: "notifications",
  Conta: "account",
  "Login demo": "loginDemo",
  Clínico: "clinical",
  Entregue: "shipped",
  Gestão: "management",
  UX: "ux",
  Infraestrutura: "infrastructure",
  Autenticação: "authentication",
  Demo: "demo",
  Formulários: "forms",
}

const sectionKeys: {
  status: RoadmapStatus
  titleKey:
    | "roadmap.sections.done.title"
    | "roadmap.sections.next.title"
    | "roadmap.sections.planned.title"
    | "roadmap.sections.later.title"
  descriptionKey:
    | "roadmap.sections.done.description"
    | "roadmap.sections.next.description"
    | "roadmap.sections.planned.description"
    | "roadmap.sections.later.description"
  icon: typeof CheckCircle2
}[] = [
  {
    status: "done",
    titleKey: "roadmap.sections.done.title",
    descriptionKey: "roadmap.sections.done.description",
    icon: CheckCircle2,
  },
  {
    status: "next",
    titleKey: "roadmap.sections.next.title",
    descriptionKey: "roadmap.sections.next.description",
    icon: Rocket,
  },
  {
    status: "planned",
    titleKey: "roadmap.sections.planned.title",
    descriptionKey: "roadmap.sections.planned.description",
    icon: Clock,
  },
  {
    status: "later",
    titleKey: "roadmap.sections.later.title",
    descriptionKey: "roadmap.sections.later.description",
    icon: Sparkles,
  },
]

function ProgressBar({ value }: { value: number }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-sidebar-foreground/80">{t("roadmap.progress")}</span>
        <span className="font-heading font-semibold tabular-nums text-sidebar-primary">
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-sidebar-primary transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function RoadmapCard({ item }: { item: RoadmapItem }) {
  const { t } = useTranslation()
  const status = statusConfig[item.status]
  const Icon = item.icon
  const itemKey = `roadmap.items.${item.id}`

  return (
    <Card
      className={cn(
        "gap-3 p-4 transition-colors hover:bg-accent/30",
        item.status === "next" && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border",
            item.status === "done"
              ? "bg-sidebar-primary/15 text-sidebar"
              : "bg-background/40 text-foreground"
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-sm font-semibold">
              {translatedOrFallback(t, `${itemKey}.title`, item.title)}
            </h3>
            <Badge variant="outline" className={status.badge}>
              <span
                className={cn("size-1.5 rounded-full", status.dot)}
              />
              {t(`roadmap.status.${item.status}`)}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {translatedOrFallback(
              t,
              `${itemKey}.description`,
              item.description
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">
              {translatedOrFallback(t, `${itemKey}.phase`, item.phase)}
            </span>
            {item.tags?.map((tag) => {
              const tagSlug = TAG_SLUGS[tag]
              const tagLabel = tagSlug
                ? translatedOrFallback(t, `roadmap.tags.${tagSlug}`, tag)
                : tag

              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-border bg-background/40 text-[11px] text-muted-foreground"
                >
                  {tagLabel}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" className="gap-1 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
    </Card>
  )
}

export function RoadmapPage() {
  const { t } = useTranslation()
  const doneCount = getRoadmapByStatus("done").length
  const nextCount = getRoadmapByStatus("next").length
  const plannedCount = getRoadmapByStatus("planned").length
  const totalCount = roadmapItems.length

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-5 border-transparent bg-sidebar p-6 text-sidebar-foreground sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
              <Map className="size-4 text-sidebar-primary" />
            </div>
            <Badge className="border-white/15 bg-white/10 text-sidebar-foreground">
              {t("roadmap.meta.versionLabel")}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold text-surface-navy-heading">
              {t("roadmap.heroTitle")}
            </h2>
            <p className="max-w-2xl text-sm text-sidebar-foreground/75">
              {t("roadmap.meta.subtitle")}
            </p>
          </div>
          <div className="max-w-md pt-1">
            <ProgressBar value={ROADMAP_META.progress} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">
              {t("roadmap.stats.delivered")}
            </span>
            <span className="font-heading text-xl font-semibold tabular-nums text-sidebar-primary">
              {doneCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">
              {t("roadmap.stats.next")}
            </span>
            <span className="font-heading text-xl font-semibold tabular-nums text-surface-navy-heading">
              {nextCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">
              {t("roadmap.stats.planned")}
            </span>
            <span className="font-heading text-xl font-semibold tabular-nums text-surface-navy-heading">
              {plannedCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">
              {t("roadmap.stats.total")}
            </span>
            <span className="font-heading text-xl font-semibold tabular-nums text-surface-navy-heading">
              {totalCount}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat label={t("roadmap.currentFocus")} value="Demo v1.1" />
        <Stat label={t("roadmap.infrastructure")} value={t("roadmap.infrastructureLater")} />
        <Stat label={t("roadmap.goal")} value={`${ROADMAP_META.progress}%`} />
      </div>

      <Card className="gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold">
            {t("roadmap.releaseStrategy")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("roadmap.releaseStrategyHint")}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(["1", "2", "3"] as const).map((step, index) => (
            <div
              key={step}
              className={cn(
                "relative flex flex-col gap-2 rounded-2xl border p-4",
                step === "1"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-background/40"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                    step === "1"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {step}
                </span>
                <span className="font-heading text-sm font-semibold">
                  {t(`roadmap.waves.${step}.title`)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(`roadmap.waves.${step}.body`)}
              </p>
              {index < 2 ? (
                <ArrowRight className="absolute top-1/2 -right-5 hidden size-4 -translate-y-1/2 text-muted-foreground md:block" />
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        {sectionKeys.map((section) => {
          const items = getRoadmapByStatus(section.status)
          const SectionIcon = section.icon

          return (
            <div key={section.status} className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/40">
                  <SectionIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-semibold">
                      {t(section.titleKey)}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-border bg-background/40"
                    >
                      {t(
                        items.length === 1
                          ? "roadmap.items_one"
                          : "roadmap.items_other",
                        { count: items.length }
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(section.descriptionKey)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {items.map((item) => (
                  <RoadmapCard key={item.id} item={item} />
                ))}
              </div>

              {section.status !== "later" ? (
                <Separator className="mt-2" />
              ) : null}
            </div>
          )
        })}
      </div>

      <Card className="flex flex-col gap-3 border-dashed bg-background/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Circle className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-sm font-semibold">
              {t("roadmap.ruleTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("roadmap.ruleDescription")}
            </p>
          </div>
        </div>
        <Badge className="w-fit shrink-0 border-border bg-card text-foreground">
          {t("roadmap.infrastructureLast")}
        </Badge>
      </Card>
    </div>
  )
}
