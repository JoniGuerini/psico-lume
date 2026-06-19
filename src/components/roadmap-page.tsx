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
import { cn } from "@/lib/utils"

const sections: {
  status: RoadmapStatus
  title: string
  description: string
  icon: typeof CheckCircle2
}[] = [
  {
    status: "done",
    title: "Já entregue",
    description: "O que compõe a base visual e funcional do Lume hoje.",
    icon: CheckCircle2,
  },
  {
    status: "next",
    title: "Próximos passos",
    description: "Prioridade imediata para fechar a v1.0 com dados mock.",
    icon: Rocket,
  },
  {
    status: "planned",
    title: "Planejado na v1.0",
    description: "Complementos que fecham o ciclo clínico antes do backend.",
    icon: Clock,
  },
  {
    status: "later",
    title: "Depois da v1.0",
    description: "Infraestrutura e escala — Supabase entra por último.",
    icon: Sparkles,
  },
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-sidebar-foreground/80">Progresso da v1.0</span>
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
  const status = statusConfig[item.status]
  const Icon = item.icon

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
            <h3 className="font-heading text-sm font-semibold">{item.title}</h3>
            <Badge variant="outline" className={status.badge}>
              <span
                className={cn("size-1.5 rounded-full", status.dot)}
              />
              {status.label}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">{item.phase}</span>
            {item.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-border bg-background/40 text-[11px] text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
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
              {ROADMAP_META.versionLabel}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold text-[#FAF6EC]">
              Roadmap & próximos passos
            </h2>
            <p className="max-w-2xl text-sm text-sidebar-foreground/75">
              {ROADMAP_META.subtitle}
            </p>
          </div>
          <div className="max-w-md pt-1">
            <ProgressBar value={ROADMAP_META.progress} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">Entregues</span>
            <span className="font-heading text-xl font-semibold tabular-nums text-sidebar-primary">
              {doneCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">Próximos</span>
            <span className="font-heading text-xl font-semibold tabular-nums text-[#FAF6EC]">
              {nextCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">Planejados</span>
            <span className="font-heading text-xl font-semibold tabular-nums text-[#FAF6EC]">
              {plannedCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-sidebar-foreground/70">Total</span>
            <span className="font-heading text-xl font-semibold tabular-nums text-[#FAF6EC]">
              {totalCount}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat label="Foco atual" value="Mock v1.0" />
        <Stat
          label="Backend"
          value="Depois"
        />
        <Stat label="Meta" value={`${ROADMAP_META.progress}%`} />
      </div>

      <Card className="gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold">
            Estratégia de release
          </h3>
          <p className="text-sm text-muted-foreground">
            Três ondas claras antes de ir para produção com Supabase.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Experiência clínica",
              body: "Prontuário, editar paciente e agendar pelo perfil.",
              active: true,
            },
            {
              step: "2",
              title: "Operação completa",
              body: "Status de sessão, financeiro integrado e busca global.",
              active: false,
            },
            {
              step: "3",
              title: "Persistência",
              body: "Supabase, auth real e deploy — só após fechar a v1.0 mock.",
              active: false,
            },
          ].map((wave, index) => (
            <div
              key={wave.step}
              className={cn(
                "relative flex flex-col gap-2 rounded-2xl border p-4",
                wave.active
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-background/40"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                    wave.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {wave.step}
                </span>
                <span className="font-heading text-sm font-semibold">
                  {wave.title}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{wave.body}</p>
              {index < 2 ? (
                <ArrowRight className="absolute top-1/2 -right-5 hidden size-4 -translate-y-1/2 text-muted-foreground md:block" />
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        {sections.map((section) => {
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
                      {section.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-border bg-background/40"
                    >
                      {items.length}{" "}
                      {items.length === 1 ? "item" : "itens"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
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
              Regra da v1.0
            </h3>
            <p className="text-sm text-muted-foreground">
              Nada de Supabase até o fluxo clínico mock estar redondo. Primeiro
              produto, depois infraestrutura.
            </p>
          </div>
        </div>
        <Badge className="w-fit shrink-0 border-border bg-card text-foreground">
          Backend por último
        </Badge>
      </Card>
    </div>
  )
}
