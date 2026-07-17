import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react"

type DragOrigin = {
  pointerId: number
  startX: number
  startY: number
  origX: number
  origY: number
}

type PanelOrigin = {
  left: number
  top: number
  width: number
}

export type DragPoint = {
  clientX: number
  clientY: number
}

export type DragEndPoint = DragPoint & {
  moved: boolean
}

type UseDraggableOffsetOptions = {
  /** Chamado a cada movimento durante um arraste ativo. */
  onDragMove?: (point: DragPoint) => void
  /** Chamado ao soltar o ponteiro (após um arraste ativo). */
  onDragEnd?: (point: DragEndPoint) => void
  /** Desliga o arraste (ex.: formulário encaixado). */
  enabled?: boolean
}

/** Coluna final do encaixe (inset + card + folga). */
export const SESSION_FORM_DOCK_COLUMN_REM = 21
/** Largura da sidebar de navegação (shadcn SIDEBAR_WIDTH). */
export const SESSION_FORM_SIDEBAR_REM = 16
/** Extra de largura no preview (coluna − sidebar). */
export const SESSION_FORM_DOCK_PREVIEW_EXTRA_REM =
  SESSION_FORM_DOCK_COLUMN_REM - SESSION_FORM_SIDEBAR_REM

/** Zona esquerda (~coluna de encaixe) no desktop. */
export function isLeftDockZone(clientX: number) {
  const spacer = document.querySelector("[data-session-form-dock-slot]")
  if (spacer instanceof HTMLElement) {
    const rect = spacer.getBoundingClientRect()
    const columnRight = Math.max(
      rect.right,
      SESSION_FORM_DOCK_COLUMN_REM * 16
    )
    return clientX <= columnRight + 24
  }
  const sidebar = document.querySelector('[data-slot="sidebar-container"]')
  if (sidebar instanceof HTMLElement) {
    const rect = sidebar.getBoundingClientRect()
    return clientX <= Math.max(rect.right + 24, SESSION_FORM_DOCK_COLUMN_REM * 16 + 8)
  }
  return clientX <= SESSION_FORM_DOCK_COLUMN_REM * 16 + 8
}

/**
 * Offset de arraste para um painel posicionado pelo Radix (Popover/Dialog).
 * Durante/após o arraste usa `position: fixed` a partir do rect inicial — assim o
 * card não “pula” quando o shell anima a retração da main.
 * Aplique `style` num wrapper interno marcado com `data-session-form-panel`.
 */
export function useDraggableOffset(
  active: boolean,
  options: UseDraggableOffsetOptions = {}
) {
  const { onDragMove, onDragEnd, enabled = true } = options
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [panelOrigin, setPanelOrigin] = useState<PanelOrigin | null>(null)
  const dragRef = useRef<DragOrigin | null>(null)
  const onDragMoveRef = useRef(onDragMove)
  const onDragEndRef = useRef(onDragEnd)
  onDragMoveRef.current = onDragMove
  onDragEndRef.current = onDragEnd

  useEffect(() => {
    if (!active) {
      setOffset({ x: 0, y: 0 })
      setIsDragging(false)
      setPanelOrigin(null)
      dragRef.current = null
    }
  }, [active])

  const resetOffset = useCallback(() => {
    setOffset({ x: 0, y: 0 })
    setIsDragging(false)
    setPanelOrigin(null)
    dragRef.current = null
  }, [])

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!enabled || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)

    const panel = event.currentTarget.closest("[data-session-form-panel]")
    if (panel instanceof HTMLElement) {
      const rect = panel.getBoundingClientRect()
      setPanelOrigin({
        left: rect.left - offset.x,
        top: rect.top - offset.y,
        width: rect.width,
      })
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: offset.x,
      origY: offset.y,
    }
    setIsDragging(true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setOffset({
      x: drag.origX + (event.clientX - drag.startX),
      y: drag.origY + (event.clientY - drag.startY),
    })
    onDragMoveRef.current?.({
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return
    const moved =
      Math.abs(event.clientX - dragRef.current.startX) > 2 ||
      Math.abs(event.clientY - dragRef.current.startY) > 2
    const point = {
      clientX: event.clientX,
      clientY: event.clientY,
      moved,
    }
    dragRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onDragEndRef.current?.(point)
  }

  const usesFixed = panelOrigin != null && (isDragging || offset.x !== 0 || offset.y !== 0)

  const style: CSSProperties = usesFixed && panelOrigin
    ? {
        position: "fixed",
        left: panelOrigin.left + offset.x,
        top: panelOrigin.top + offset.y,
        width: panelOrigin.width,
        margin: 0,
        zIndex: 80,
        transform: "none",
      }
    : {
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }

  const handleProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }

  return {
    style,
    handleProps,
    offset,
    resetOffset,
    isDragging,
    usesFixed,
  }
}
