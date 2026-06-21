function LumeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248z"
        fill="var(--theme-logo-mark)"
      />
      <path
        d="M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1.001a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.717z"
        fill="#ffffff"
        opacity="0.28"
      />
    </svg>
  )
}

type ShellLeftRailProps = {
  children?: React.ReactNode
}

export function ShellLeftRail({ children }: ShellLeftRailProps) {
  return (
    <div className="relative hidden h-full w-1/2 shrink-0 overflow-hidden lg:block">
      {children}
    </div>
  )
}

import { useTranslation } from "@/context/locale-provider"
import { APP_VERSION_LABEL } from "@/lib/app-version"

export function LoginHeroSlot() {
  const { t } = useTranslation()

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-sidebar-foreground">
      <div className="flex flex-col items-center gap-6">
        <LumeMark className="size-28 shrink-0 drop-shadow-lg" />
        <span className="font-heading text-6xl font-semibold tracking-tight">
          {t("nav.brand")}
        </span>
        <p className="max-w-xs text-balance text-sidebar-foreground/75">
          {t("login.heroTagline")}
        </p>
      </div>

      <p className="absolute bottom-12 flex items-center gap-2 text-xs text-sidebar-foreground/60">
        <span>
          © {new Date().getFullYear()} {t("nav.brand")}
        </span>
        <span aria-hidden="true" className="text-sidebar-foreground/35">
          ·
        </span>
        <span className="tabular-nums text-sidebar-foreground/50">
          {APP_VERSION_LABEL}
        </span>
      </p>
    </div>
  )
}
