import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { useClinicData } from "@/context/clinic-data-provider"
import { APP_PAGE_ID, type AppPageId } from "@/lib/app-pages"
import {
  onboardingTourSteps,
  clearOnboardingTourCompleted,
  readOnboardingTourCompleted,
  waitForTourTarget,
  writeOnboardingTourCompleted,
  type OnboardingTourStep,
} from "@/lib/onboarding-tour"

type OnboardingTourContextValue = {
  isActive: boolean
  targetReady: boolean
  stepIndex: number
  currentStep: OnboardingTourStep | null
  totalSteps: number
  next: () => void
  skip: () => void
  restartTour: () => void
}

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(
  null
)

type OnboardingTourProviderProps = {
  children: ReactNode
  activePage: AppPageId
  authenticated: boolean
  onNavigate: (page: AppPageId) => void
  onCloseAccount?: () => void
}

function stepMatchesPage(step: OnboardingTourStep, activePage: AppPageId) {
  return step.page === null || step.page === activePage
}

export function OnboardingTourProvider({
  children,
  activePage,
  authenticated,
  onNavigate,
  onCloseAccount,
}: OnboardingTourProviderProps) {
  const { patients } = useClinicData()
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [targetReady, setTargetReady] = useState(false)
  const skipMissingRef = useRef(false)

  const currentStep = isActive ? (onboardingTourSteps[stepIndex] ?? null) : null
  const totalSteps = onboardingTourSteps.length

  const complete = useCallback(() => {
    writeOnboardingTourCompleted()
    setIsActive(false)
    setStepIndex(0)
    setTargetReady(false)
  }, [])

  const skip = useCallback(() => {
    complete()
  }, [complete])

  const advanceStep = useCallback(() => {
    setTargetReady(false)
    setStepIndex((index) => {
      if (index >= onboardingTourSteps.length - 1) {
        return index
      }
      return index + 1
    })
  }, [])

  const next = useCallback(() => {
    if (stepIndex >= onboardingTourSteps.length - 1) {
      complete()
      return
    }
    advanceStep()
  }, [advanceStep, complete, stepIndex])

  const skipMissingTarget = useCallback(() => {
    if (skipMissingRef.current) return
    skipMissingRef.current = true

    if (stepIndex >= onboardingTourSteps.length - 1) {
      complete()
      skipMissingRef.current = false
      return
    }

    advanceStep()
    window.setTimeout(() => {
      skipMissingRef.current = false
    }, 0)
  }, [advanceStep, complete, stepIndex])

  const restartTour = useCallback(() => {
    clearOnboardingTourCompleted()
    onCloseAccount?.()
    onNavigate(APP_PAGE_ID.inicio)
    setStepIndex(0)
    setTargetReady(false)
    setIsActive(true)
  }, [onCloseAccount, onNavigate])

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
      setStepIndex(0)
      setIsActive(true)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [authenticated, activePage, patients.length])

  useEffect(() => {
    if (!isActive || !currentStep) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- reseta prontidão ao sair do passo */
      setTargetReady(false)
      return
    }

    if (currentStep.navigateTo && activePage !== currentStep.navigateTo) {
      onNavigate(currentStep.navigateTo)
      setTargetReady(false)
      return
    }

    if (!stepMatchesPage(currentStep, activePage)) {
      setTargetReady(false)
      return
    }

    const cancelWait = waitForTourTarget(
      currentStep.targetSelector,
      (target) => {
        target.scrollIntoView({ block: "center", behavior: "smooth" })
        setTargetReady(true)
      },
      skipMissingTarget
    )

    return cancelWait
  }, [
    isActive,
    currentStep,
    activePage,
    stepIndex,
    onNavigate,
    skipMissingTarget,
  ])

  useEffect(() => {
    if (!isActive) return
    if (stepIndex >= onboardingTourSteps.length) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- encerra o tour ao passar do último passo */
      complete()
    }
  }, [isActive, stepIndex, complete])

  const visibleStep =
    isActive &&
    currentStep &&
    targetReady &&
    stepMatchesPage(currentStep, activePage)
      ? currentStep
      : null

  const value = useMemo(
    () => ({
      isActive: Boolean(visibleStep),
      targetReady,
      stepIndex,
      currentStep: visibleStep,
      totalSteps,
      next,
      skip,
      restartTour,
    }),
    [
      visibleStep,
      targetReady,
      stepIndex,
      totalSteps,
      next,
      skip,
      restartTour,
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
