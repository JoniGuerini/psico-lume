import { APP_PAGE_ID, type AppPageId } from "@/lib/app-pages"

export const ONBOARDING_TOUR_STORAGE_KEY = "lume-onboarding-tour-completed"

export type OnboardingTourStep = {
  id: string
  /** Seletor CSS do elemento destacado (ex.: [data-tour="home-new-patient"]) */
  targetSelector: string
  /** Página em que o passo deve aparecer */
  page: AppPageId
  titleKey: string
  descriptionKey: string
}

/** Passos do tour — expandir conforme novas etapas forem definidas. */
export const onboardingTourSteps: OnboardingTourStep[] = [
  {
    id: "home-new-patient",
    targetSelector: '[data-tour="home-new-patient"]',
    page: APP_PAGE_ID.inicio,
    titleKey: "tour.steps.homeNewPatient.title",
    descriptionKey: "tour.steps.homeNewPatient.description",
  },
]

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
