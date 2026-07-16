import { APP_PAGE_ID, type AppPageId } from "@/lib/app-pages"

export const ONBOARDING_TOUR_STORAGE_KEY = "lume-onboarding-tour-completed"

/** IDs estáveis para `data-tour` na sidebar. */
export const TOUR_SIDEBAR_TARGETS: Partial<Record<AppPageId, string>> = {
  [APP_PAGE_ID.pacientes]: "nav-pacientes",
  [APP_PAGE_ID.agenda]: "nav-agenda",
  [APP_PAGE_ID.aReceber]: "nav-a-receber",
  [APP_PAGE_ID.financeiro]: "nav-financeiro",
}

export type OnboardingTourStep = {
  id: string
  /** Seletor CSS do elemento destacado (ex.: [data-tour="home-new-patient"]) */
  targetSelector: string
  /** Página em que o passo aparece; null = qualquer página (sidebar/header) */
  page: AppPageId | null
  /** Navega para a página ao entrar neste passo, se necessário */
  navigateTo?: AppPageId
  titleKey: string
  descriptionKey: string
}

/** Passos do tour — ordem define a sequência exibida ao usuário. */
export const onboardingTourSteps: OnboardingTourStep[] = [
  {
    id: "home-new-patient",
    targetSelector: '[data-tour="home-new-patient"]',
    page: APP_PAGE_ID.inicio,
    titleKey: "tour.steps.homeNewPatient.title",
    descriptionKey: "tour.steps.homeNewPatient.description",
  },
  {
    id: "home-stats",
    targetSelector: '[data-tour="home-stats"]',
    page: APP_PAGE_ID.inicio,
    titleKey: "tour.steps.homeStats.title",
    descriptionKey: "tour.steps.homeStats.description",
  },
  {
    id: "nav-pacientes",
    targetSelector: '[data-tour="nav-pacientes"]',
    page: null,
    titleKey: "tour.steps.navPacientes.title",
    descriptionKey: "tour.steps.navPacientes.description",
  },
  {
    id: "nav-agenda",
    targetSelector: '[data-tour="nav-agenda"]',
    page: null,
    titleKey: "tour.steps.navAgenda.title",
    descriptionKey: "tour.steps.navAgenda.description",
  },
  {
    id: "nav-a-receber",
    targetSelector: '[data-tour="nav-a-receber"]',
    page: null,
    titleKey: "tour.steps.navAReceber.title",
    descriptionKey: "tour.steps.navAReceber.description",
  },
  {
    id: "nav-financeiro",
    targetSelector: '[data-tour="nav-financeiro"]',
    page: null,
    titleKey: "tour.steps.navFinanceiro.title",
    descriptionKey: "tour.steps.navFinanceiro.description",
  },
  {
    id: "header-search",
    targetSelector: '[data-tour="header-search"]',
    page: null,
    titleKey: "tour.steps.headerSearch.title",
    descriptionKey: "tour.steps.headerSearch.description",
  },
  {
    id: "data-export",
    targetSelector: '[data-tour="data-export"]',
    page: APP_PAGE_ID.dados,
    navigateTo: APP_PAGE_ID.dados,
    titleKey: "tour.steps.headerExport.title",
    descriptionKey: "tour.steps.headerExport.description",
  },
  {
    id: "header-notifications",
    targetSelector: '[data-tour="header-notifications"]',
    page: null,
    titleKey: "tour.steps.headerNotifications.title",
    descriptionKey: "tour.steps.headerNotifications.description",
  },
  {
    id: "nav-account",
    targetSelector: '[data-tour="nav-account"]',
    page: null,
    titleKey: "tour.steps.navAccount.title",
    descriptionKey: "tour.steps.navAccount.description",
  },
]

const TARGET_POLL_INTERVAL_MS = 50
const TARGET_POLL_MAX_ATTEMPTS = 40

export function queryTourTarget(selector: string): HTMLElement | null {
  const element = document.querySelector(selector)
  return element instanceof HTMLElement ? element : null
}

export function waitForTourTarget(
  selector: string,
  onFound: (element: HTMLElement) => void,
  onTimeout: () => void
) {
  let attempts = 0
  let cancelled = false

  const poll = () => {
    if (cancelled) return

    const target = queryTourTarget(selector)
    if (target) {
      onFound(target)
      return
    }

    if (attempts >= TARGET_POLL_MAX_ATTEMPTS) {
      onTimeout()
      return
    }

    attempts += 1
    window.setTimeout(poll, TARGET_POLL_INTERVAL_MS)
  }

  poll()

  return () => {
    cancelled = true
  }
}

export function readOnboardingTourCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_TOUR_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function writeOnboardingTourCompleted() {
  try {
    localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, "1")
  } catch {
    /* ignore */
  }
}

export function clearOnboardingTourCompleted() {
  try {
    localStorage.removeItem(ONBOARDING_TOUR_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
