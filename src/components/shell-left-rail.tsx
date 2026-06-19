import { useLayoutEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import {
  LEFT_RAIL_APP_WIDTH,
  LEFT_RAIL_LOGIN_WIDTH,
  leftRailTransition,
  loginHeroEnterTransition,
  loginHeroExitTransition,
} from "@/lib/motion-layout"

function LumeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248z"
        fill="#a8d5ba"
      />
      <path
        d="M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1.001a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.717z"
        fill="#ffffff"
        opacity="0.28"
      />
    </svg>
  )
}

function useLeftRailWidths() {
  const [widths, setWidths] = useState<{ login: number; app: number } | null>(
    null
  )

  useLayoutEffect(() => {
    function measure() {
      const probe = document.createElement("div")
      probe.style.cssText =
        "position:absolute;visibility:hidden;width:var(--sidebar-width,16rem);pointer-events:none"
      document.body.appendChild(probe)
      const app = probe.getBoundingClientRect().width
      probe.remove()

      setWidths({
        login: window.innerWidth * 0.5,
        app,
      })
    }

    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  return widths
}

type ShellLeftRailProps = {
  authenticated: boolean
  loginExiting: boolean
  children?: React.ReactNode
}

export function ShellLeftRail({
  authenticated,
  loginExiting,
  children,
}: ShellLeftRailProps) {
  const reducedMotion = useReducedMotion()
  const widths = useLeftRailWidths()

  const railWidth = (() => {
    if (authenticated) return 0
    if (loginExiting) {
      return widths?.app ?? LEFT_RAIL_APP_WIDTH
    }
    return widths?.login ?? LEFT_RAIL_LOGIN_WIDTH
  })()

  const snapShut = authenticated || reducedMotion

  return (
    <motion.div
      aria-hidden={authenticated}
      className="relative hidden h-full min-h-0 shrink-0 overflow-hidden will-change-[width] lg:block"
      initial={false}
      animate={{ width: railWidth }}
      transition={snapShut ? { duration: 0 } : leftRailTransition}
    >
      {!authenticated ? children : null}
    </motion.div>
  )
}

type LoginHeroSlotProps = {
  exiting?: boolean
}

export function LoginHeroSlot({ exiting = false }: LoginHeroSlotProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-sidebar-foreground"
      initial={{ opacity: 0, x: -24 }}
      animate={
        exiting
          ? { opacity: 0, x: -28, filter: "blur(6px)" }
          : { opacity: 1, x: 0, filter: "blur(0px)" }
      }
      transition={exiting ? loginHeroExitTransition : loginHeroEnterTransition}
    >
      <div className="flex flex-col items-center gap-6">
        <LumeMark className="size-28 shrink-0 drop-shadow-lg" />
        <span className="font-heading text-6xl font-semibold tracking-tight">
          Lume
        </span>
        <p className="max-w-xs text-balance text-sidebar-foreground/75">
          Sua clínica em foco, do agendamento ao acompanhamento.
        </p>
      </div>

      <p className="absolute bottom-12 text-xs text-sidebar-foreground/60">
        © {new Date().getFullYear()} Lume · Cuidado psicológico com leveza
      </p>
    </motion.div>
  )
}
