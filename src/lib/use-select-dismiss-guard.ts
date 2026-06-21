"use client"

import { useCallback, useRef } from "react"

import {
  createSelectDismissGuard,
  getInteractOutsideTarget,
  preventDialogDismissIfNeeded,
  resetSelectDismissGuard,
  shouldPreventDialogOutsideDismiss,
} from "@/lib/dialog-outside-guard"

type OutsideEvent = Parameters<typeof preventDialogDismissIfNeeded>[0]

export function useSelectDismissGuard() {
  const guardRef = useRef(createSelectDismissGuard())

  const onSelectOpenChange = useCallback((open: boolean) => {
    guardRef.current.onSelectOpenChange(open)
  }, [])

  const shouldBlockDialogClose = useCallback((target?: EventTarget | null) => {
    return (
      guardRef.current.shouldPreventDialogDismiss(target ?? null) ||
      shouldPreventDialogOutsideDismiss({ target: target ?? null })
    )
  }, [])

  const reset = useCallback(() => {
    guardRef.current.reset()
    resetSelectDismissGuard()
  }, [])

  const handleOutsideEvent = useCallback(
    (event: OutsideEvent) => {
      preventDialogDismissIfNeeded(event)
      if (shouldBlockDialogClose(getInteractOutsideTarget(event))) {
        event.preventDefault()
      }
    },
    [shouldBlockDialogClose]
  )

  const dialogContentHandlers = {
    onPointerDownOutside: handleOutsideEvent,
    onInteractOutside: handleOutsideEvent,
    onEscapeKeyDown: (event: { preventDefault: () => void }) => {
      if (shouldBlockDialogClose(null)) {
        event.preventDefault()
      }
    },
  }

  return {
    onSelectOpenChange,
    shouldBlockDialogClose,
    reset,
    dialogContentHandlers,
  }
}
