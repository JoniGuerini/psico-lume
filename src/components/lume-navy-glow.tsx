import { cn } from "@/lib/utils"

type LumeNavyGlowProps = {
  className?: string
  /** Camada única no viewport — evita costura entre sidebar e fundo inset. */
  fixed?: boolean
}

/** Orbes esmaecidos do painel navy — igual ao hero da tela de login. */
export function LumeNavyGlow({ className, fixed = false }: LumeNavyGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none overflow-hidden",
        fixed ? "fixed inset-0 z-0" : "absolute inset-0",
        className
      )}
    >
      <div className="absolute -top-24 -right-24 size-80 rounded-full bg-sidebar-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-sidebar-primary/10 blur-3xl" />
    </div>
  )
}
