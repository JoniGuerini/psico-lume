import { useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useOnboardingTour } from "@/context/onboarding-tour-provider"
import { useTranslation } from "@/context/locale-provider"
import { cn } from "@/lib/utils"

const SPOTLIGHT_PADDING = 10
const VIEWPORT_MARGIN = 16
const CARD_GAP = 20
const CARD_WIDTH = 360
const CARD_ESTIMATED_HEIGHT = 220

type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

type CardPlacement = "below" | "above" | "right" | "left"

function measureTarget(selector: string): SpotlightRect | null {
  const element = document.querySelector(selector)
  if (!(element instanceof HTMLElement)) return null

  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null

  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  }
}

function clampHorizontal(
  spotlight: SpotlightRect,
  cardWidth: number,
  viewportWidth: number
) {
  const ideal =
    spotlight.left + spotlight.width / 2 - cardWidth / 2
  return Math.min(
    Math.max(VIEWPORT_MARGIN, ideal),
    viewportWidth - cardWidth - VIEWPORT_MARGIN
  )
}

function rectsOverlap(
  a: SpotlightRect,
  b: SpotlightRect,
  gap = CARD_GAP
): boolean {
  return !(
    a.left + a.width + gap <= b.left ||
    b.left + b.width + gap <= a.left ||
    a.top + a.height + gap <= b.top ||
    b.top + b.height + gap <= a.top
  )
}

function computeCardPosition(
  spotlight: SpotlightRect,
  cardWidth: number,
  cardHeight: number
): { top: number; left: number; placement: CardPlacement } {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const candidates: Array<{ placement: CardPlacement; top: number; left: number }> =
    [
      {
        placement: "below",
        top: spotlight.top + spotlight.height + CARD_GAP,
        left: clampHorizontal(spotlight, cardWidth, viewportWidth),
      },
      {
        placement: "above",
        top: spotlight.top - CARD_GAP - cardHeight,
        left: clampHorizontal(spotlight, cardWidth, viewportWidth),
      },
      {
        placement: "right",
        top: Math.min(
          Math.max(
            VIEWPORT_MARGIN,
            spotlight.top + spotlight.height / 2 - cardHeight / 2
          ),
          viewportHeight - cardHeight - VIEWPORT_MARGIN
        ),
        left: spotlight.left + spotlight.width + CARD_GAP,
      },
      {
        placement: "left",
        top: Math.min(
          Math.max(
            VIEWPORT_MARGIN,
            spotlight.top + spotlight.height / 2 - cardHeight / 2
          ),
          viewportHeight - cardHeight - VIEWPORT_MARGIN
        ),
        left: spotlight.left - CARD_GAP - cardWidth,
      },
    ]

  for (const candidate of candidates) {
    const cardRect: SpotlightRect = {
      top: candidate.top,
      left: candidate.left,
      width: cardWidth,
      height: cardHeight,
    }

    const insideViewport =
      cardRect.top >= VIEWPORT_MARGIN &&
      cardRect.left >= VIEWPORT_MARGIN &&
      cardRect.top + cardRect.height <= viewportHeight - VIEWPORT_MARGIN &&
      cardRect.left + cardRect.width <= viewportWidth - VIEWPORT_MARGIN

    if (insideViewport && !rectsOverlap(spotlight, cardRect)) {
      return candidate
    }
  }

  return {
    placement: "below",
    top: Math.min(
      spotlight.top + spotlight.height + CARD_GAP,
      viewportHeight - cardHeight - VIEWPORT_MARGIN
    ),
    left: clampHorizontal(spotlight, cardWidth, viewportWidth),
  }
}

export function OnboardingTourOverlay() {
  const { t } = useTranslation()
  const { isActive, currentStep, stepIndex, totalSteps, next, skip } =
    useOnboardingTour()
  const maskId = useId().replace(/:/g, "")
  const cardRef = useRef<HTMLDivElement>(null)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({})
  const [cardPlacement, setCardPlacement] = useState<CardPlacement>("below")

  const updateLayout = useCallback(() => {
    if (!currentStep) return

    const nextSpotlight = measureTarget(currentStep.targetSelector)
    setSpotlight(nextSpotlight)
    if (!nextSpotlight) return

    const cardWidth = Math.min(CARD_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
    const cardHeight =
      cardRef.current?.getBoundingClientRect().height ?? CARD_ESTIMATED_HEIGHT
    const { top, left, placement } = computeCardPosition(
      nextSpotlight,
      cardWidth,
      cardHeight
    )

    setCardPlacement(placement)
    setCardStyle({
      top,
      left,
      width: cardWidth,
    })
  }, [currentStep])

  useEffect(() => {
    if (!isActive || !currentStep) {
      setSpotlight(null)
      return
    }

    updateLayout()

    window.addEventListener("resize", updateLayout)
    window.addEventListener("scroll", updateLayout, true)

    const targetElement = document.querySelector(currentStep.targetSelector)
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateLayout)
        : null

    if (targetElement instanceof HTMLElement) {
      resizeObserver?.observe(targetElement)
    }
    if (cardRef.current) {
      resizeObserver?.observe(cardRef.current)
    }

    const raf = window.requestAnimationFrame(updateLayout)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", updateLayout)
      window.removeEventListener("scroll", updateLayout, true)
      resizeObserver?.disconnect()
    }
  }, [isActive, currentStep, updateLayout])

  if (!isActive || !currentStep || !spotlight) return null

  const isLastStep = stepIndex >= totalSteps - 1

  return createPortal(
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[9998]"
        aria-hidden="true"
      >
        <svg
          className="pointer-events-auto absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={14}
                ry={14}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.72)"
            mask={`url(#${maskId})`}
          />
        </svg>

        <div
          className="pointer-events-none absolute rounded-[14px] ring-2 ring-primary shadow-[0_0_0_4px_rgba(255,255,255,0.12)]"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      </div>

      <div
        ref={cardRef}
        className={cn(
          "pointer-events-auto fixed z-[9999]",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          cardPlacement === "below" && "origin-top",
          cardPlacement === "above" && "origin-bottom"
        )}
        style={cardStyle}
      >
        <Card
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-tour-title"
          className="gap-4 border-border bg-card p-5 shadow-2xl ring-1 ring-foreground/10"
        >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="size-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t("tour.stepCounter", {
                current: stepIndex + 1,
                total: totalSteps,
              })}
            </p>
            <h2
              id="onboarding-tour-title"
              className="font-heading text-base font-semibold leading-snug"
            >
              {t(currentStep.titleKey)}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(currentStep.descriptionKey)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={skip}
          >
            {t("tour.skip")}
          </Button>
          <Button type="button" size="sm" onClick={next}>
            {isLastStep ? t("tour.finish") : t("tour.next")}
          </Button>
        </div>
        </Card>
      </div>
    </>,
    document.body
  )
}
