import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useClinicData } from "@/context/clinic-data-provider"
import { APP_PAGE_ID, type AppPageId } from "@/lib/app-pages"
import {
  onboardingTourSteps,
  clearOnboardingTourCompleted,
  readOnboardingTourCompleted,
  writeOnboardingTourCompleted,
  type OnboardingTourStep,
} from "@/lib/onboarding-tour"

type OnboardingTourContextValue = {
  isActive: boolean
  stepIndex: number
  currentStep: OnboardingTourStep | null
  totalSteps: number
  next: () => void
  skip: () => void
  restart: () => void
}

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(
  null
)

type OnboardingTourProviderProps = {
  children: ReactNode
  activePage: AppPageId
  authenticated: boolean
}

export function OnboardingTourProvider({
  children,
  activePage,
  authenticated,
}: OnboardingTourProviderProps) {
  const { patients } = useClinicData()
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const currentStep = isActive ? (onboardingTourSteps[stepIndex] ?? null) : null
  const totalSteps = onboardingTourSteps.length

  const complete = useCallback(() => {
    writeOnboardingTourCompleted()
    setIsActive(false)
    setStepIndex(0)
  }, [])

  const skip = useCallback(() => {
    complete()
  }, [complete])

  const next = useCallback(() => {
    if (stepIndex >= onboardingTourSteps.length - 1) {
      complete()
      return
    }
    setStepIndex((index) => index + 1)
  }, [complete, stepIndex])

  const restart = useCallback(() => {
    setStepIndex(0)
    setIsActive(true)
  }, [])

  useEffect(() => {
    if (!authenticated) return
    if (activePage !== APP_PAGE_ID.inicio) return

    const forceTour =
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).has("tour")

    if (forceTour) {
      clearOnboardingTourCompleted()
    } else if (readOnboardingTourCompleted()) {
      return
    }

    if (!forceTour && patients.length > 0) return

    const timer = window.setTimeout(() => {
      const target = document.querySelector(
        onboardingTourSteps[0]?.targetSelector ?? ""
      )
      if (target) {
        setStepIndex(0)
        setIsActive(true)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [authenticated, activePage, patients.length])

  useEffect(() => {
    if (!isActive || !currentStep) return
    if (currentStep.page !== activePage) return

    const target = document.querySelector(currentStep.targetSelector)
    target?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [isActive, currentStep, activePage, stepIndex])

  const value = useMemo(
    () => ({
      isActive: isActive && currentStep?.page === activePage,
      stepIndex,
      currentStep: currentStep?.page === activePage ? currentStep : null,
      totalSteps,
      next,
      skip,
      restart,
    }),
    [
      isActive,
      stepIndex,
      currentStep,
      activePage,
      totalSteps,
      next,
      skip,
      restart,
    ]
  )

  return (
    <OnboardingTourContext.Provider value={value}>
      {children}
    </OnboardingTourContext.Provider>
  )
}

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext)
  if (!context) {
    throw new Error(
      "useOnboardingTour must be used within OnboardingTourProvider"
    )
  }
  return context
}
