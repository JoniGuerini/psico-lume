import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DEFAULT_TOAST_POSITION,
  persistToastPosition,
  readStoredToastPosition,
  toastPositionClassName,
  toastPositionPresets,
  toastStackClassName,
  type ToastPosition,
  type ToastVariant,
} from "@/lib/toast-preferences"
import { cn } from "@/lib/utils"

type ToastItem = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

type ToastOptions = {
  variant?: ToastVariant
  duration?: number
  description?: string
}

type ToastContextValue = {
  position: ToastPosition
  setPosition: (position: ToastPosition) => void
  toast: (title: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantConfig: Record<
  ToastVariant,
  {
    icon: typeof CheckCircle2
    className: string
    iconClassName: string
    progressClassName: string
  }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
    iconClassName: "text-emerald-600",
    progressClassName: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    iconClassName: "text-destructive",
    progressClassName: "bg-destructive",
  },
  info: {
    icon: Info,
    className: "border-border bg-card text-foreground",
    iconClassName: "text-primary",
    progressClassName: "bg-primary",
  },
}

function Toaster({
  toasts,
  position,
  onDismiss,
}: {
  toasts: ToastItem[]
  position: ToastPosition
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[200] flex w-[min(100%-2rem,26rem)] flex-col gap-2",
        toastPositionClassName(position),
        toastStackClassName(position)
      )}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((item) => {
        const config = variantConfig[item.variant]
        const Icon = config.icon

        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto overflow-hidden rounded-2xl border shadow-lg",
              config.className
            )}
          >
            <div className="flex items-start gap-3 px-4 py-3 text-sm">
              <Icon className={cn("mt-0.5 size-4 shrink-0", config.iconClassName)} />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-xs leading-relaxed opacity-80">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 opacity-70 hover:opacity-100"
                aria-label="Fechar"
                onClick={() => onDismiss(item.id)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="h-1 bg-black/5">
              <div
                className={cn("h-full origin-left", config.progressClassName)}
                style={{
                  animation: `toast-progress-shrink ${item.duration}ms linear forwards`,
                }}
                aria-hidden
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [position, setPositionState] = useState<ToastPosition>(() =>
    readStoredToastPosition()
  )
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer != null) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (title: string, options: ToastOptions = {}) => {
      const id = crypto.randomUUID()
      const variant = options.variant ?? "success"
      const duration =
        options.duration ?? (options.description ? 4500 : 3000)

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          description: options.description,
          variant,
          duration,
        },
      ])

      const timer = window.setTimeout(() => dismiss(id), duration)
      timersRef.current.set(id, timer)
    },
    [dismiss]
  )

  const setPosition = useCallback(
    (next: ToastPosition) => {
      setPositionState(next)
      persistToastPosition(next)
    },
    []
  )

  const value = useMemo(
    () => ({
      position,
      setPosition,
      toast,
    }),
    [position, setPosition, toast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} position={position} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider")
  }
  return context
}

export {
  DEFAULT_TOAST_POSITION,
  toastPositionPresets,
  type ToastPosition,
  type ToastVariant,
}
