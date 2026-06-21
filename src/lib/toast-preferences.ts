export const TOAST_POSITION_STORAGE_KEY = "lume-toast-position"

export type ToastPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"

export type ToastVariant = "success" | "error" | "info"

export const DEFAULT_TOAST_POSITION: ToastPosition = "bottom-right"

const VALID_POSITIONS = new Set<ToastPosition>([
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
])

export function isToastPosition(
  value: string | null | undefined
): value is ToastPosition {
  return value != null && VALID_POSITIONS.has(value as ToastPosition)
}

export function readStoredToastPosition(): ToastPosition {
  try {
    const raw = localStorage.getItem(TOAST_POSITION_STORAGE_KEY)
    return isToastPosition(raw) ? raw : DEFAULT_TOAST_POSITION
  } catch {
    return DEFAULT_TOAST_POSITION
  }
}

export function persistToastPosition(position: ToastPosition) {
  localStorage.setItem(TOAST_POSITION_STORAGE_KEY, position)
}

export const toastPositionPresets: {
  id: ToastPosition
  label: string
  description: string
}[] = [
  {
    id: "top-left",
    label: "Superior esquerdo",
    description: "Toasts no canto superior esquerdo.",
  },
  {
    id: "top-right",
    label: "Superior direito",
    description: "Toasts no canto superior direito.",
  },
  {
    id: "bottom-left",
    label: "Inferior esquerdo",
    description: "Toasts no canto inferior esquerdo.",
  },
  {
    id: "bottom-right",
    label: "Inferior direito",
    description: "Padrão — canto inferior direito.",
  },
]

export function toastPositionClassName(position: ToastPosition) {
  switch (position) {
    case "top-left":
      return "top-4 left-4 items-start"
    case "top-right":
      return "top-4 right-4 items-end"
    case "bottom-left":
      return "bottom-4 left-4 items-start"
    case "bottom-right":
    default:
      return "bottom-4 right-4 items-end"
  }
}

export function toastStackClassName(position: ToastPosition) {
  return position.startsWith("top") ? "flex-col" : "flex-col-reverse"
}
