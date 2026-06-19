/** Painel creme compartilhado entre login e app. */
export const LUME_MAIN_SURFACE_CLASS =
  "relative flex min-h-0 min-w-0 flex-1 flex-col self-stretch overflow-hidden rounded-2xl bg-background shadow-sm m-2 ml-0"

/** Fade único na troca login ↔ app. */
export const authFadeTransition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as const,
}
