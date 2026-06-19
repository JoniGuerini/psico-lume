export {
  LUME_DIALOG_SURFACE_CLASS,
  LUME_MAIN_SURFACE_CLASS,
  lumeSurfaces,
} from "@/lib/design-system"

/** Fade único na troca login ↔ app. */
export const authFadeTransition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as const,
}
