/** layoutId legado — painel creme compartilhado (não usado no morph atual). */
export const LUME_MAIN_SURFACE_ID = "lume-main-surface"

/** Mesmas classes nos dois estados. */
export const LUME_MAIN_SURFACE_CLASS =
  "relative flex min-h-0 min-w-0 flex-1 flex-col self-stretch overflow-hidden rounded-2xl bg-background shadow-sm m-2 ml-0"

/** Largura do trilho esquerdo no app (gap da sidebar inset expandida). */
export const LEFT_RAIL_APP_WIDTH = "var(--sidebar-width)"

/** Largura do trilho esquerdo no login desktop (hero). */
export const LEFT_RAIL_LOGIN_WIDTH = "50%"

/** Entrada suave — desaceleração longa no final. */
export const enterEase = [0.16, 1, 0.3, 1] as const

/** Saída suave — começa devagar. */
export const exitEase = [0.4, 0, 0.2, 1] as const

/** Animação horizontal do painel creme (trilho esquerdo). */
export const leftRailTransition = {
  duration: 0.72,
  ease: enterEase,
}

export const surfaceTransition = {
  layout: { duration: 0.72, ease: enterEase },
}

/** Sidebar + main entram juntos — mesmo estado, mesma curva, sem delay. */
export const shellChromeEnterTransition = {
  duration: 0.45,
  ease: enterEase,
}

export const shellChromeExitTransition = {
  duration: 0.52,
  ease: exitEase,
}

export const shellChromeSidebarHidden = { opacity: 0, x: -16 }
export const shellChromeMainHidden = { opacity: 0, x: 16 }
export const shellChromeVisible = { opacity: 1, x: 0 }

/** @deprecated use shellChromeEnterTransition */
export const shellPanelEnterTransition = shellChromeEnterTransition

export const sidebarEnterTransition = shellChromeEnterTransition

export const appContentEnterTransition = shellChromeEnterTransition

export const appContentExitTransition = shellChromeExitTransition

export const loginHeroExitTransition = {
  duration: 0.52,
  ease: exitEase,
}

export const loginFormExitTransition = {
  duration: 0.4,
  ease: exitEase,
}

export const loginHeroEnterTransition = {
  duration: 0.62,
  ease: enterEase,
  delay: 0.55,
}

export const loginFormEnterTransition = {
  duration: 0.58,
  ease: enterEase,
  delay: 0.42,
}

/** Aguarda fade do form; conteúdo do app entra enquanto o trilho ainda morfa. */
export const LOGIN_EXIT_HANDOFF_MS = 420

/** Aguarda fade do app antes de voltar ao login. */
export const LOGOUT_EXIT_HANDOFF_MS = 540
