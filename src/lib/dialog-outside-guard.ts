const PORTAL_TARGET_SELECTOR = [
  "[data-radix-popper-content-wrapper]",
  '[data-slot="select-content"]',
  '[data-slot="select-trigger"]',
  "[data-radix-select-viewport]",
  '[data-slot="dropdown-menu-content"]',
  '[data-slot="dropdown-menu-sub-content"]',
  '[data-slot="popover-content"]',
  '[data-slot="context-menu-content"]',
  '[data-slot="menubar-content"]',
].join(", ")

const SELECT_OPEN_SELECTOR =
  '[data-slot="select-content"][data-state="open"], [data-slot="select-content"][data-open]'

let globalSelectOpenCount = 0
let globalSelectSuppressUntil = 0

export function notifySelectOpenChange(open: boolean) {
  if (open) {
    globalSelectOpenCount += 1
    globalSelectSuppressUntil = 0
    return
  }
  globalSelectOpenCount = Math.max(0, globalSelectOpenCount - 1)
  if (globalSelectOpenCount === 0) {
    globalSelectSuppressUntil = Date.now() + 120
  }
}

export function resetSelectDismissGuard() {
  globalSelectOpenCount = 0
  globalSelectSuppressUntil = 0
}

export function getInteractOutsideTarget(event: {
  detail?: { originalEvent?: { target?: EventTarget | null } }
  target?: EventTarget | null
}) {
  return event.detail?.originalEvent?.target ?? event.target ?? null
}

export function isPortaledOverlayTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(PORTAL_TARGET_SELECTOR))
}

export function hasOpenSelectInDocument() {
  if (document.querySelector(SELECT_OPEN_SELECTOR)) return true
  const content = document.querySelector('[data-slot="select-content"]')
  if (!content) return false
  return content.getAttribute("data-state") !== "closed"
}

export function shouldPreventDialogOutsideDismiss(
  event: Parameters<typeof getInteractOutsideTarget>[0]
) {
  const target = getInteractOutsideTarget(event)
  if (globalSelectOpenCount > 0) return true
  if (Date.now() < globalSelectSuppressUntil) return true
  if (hasOpenSelectInDocument()) return true
  if (isPortaledOverlayTarget(target)) return true
  return false
}

export function preventDialogDismissIfNeeded(
  event: { preventDefault: () => void } & Parameters<
    typeof getInteractOutsideTarget
  >[0]
) {
  if (shouldPreventDialogOutsideDismiss(event)) {
    event.preventDefault()
  }
}

// Per-dialog guard for components that track multiple selects locally
export function createSelectDismissGuard() {
  let openCount = 0
  let suppressUntil = 0

  return {
    onSelectOpenChange(open: boolean) {
      if (open) {
        openCount += 1
        suppressUntil = 0
        return
      }
      openCount = Math.max(0, openCount - 1)
      if (openCount === 0) {
        suppressUntil = Date.now() + 500
      }
    },
    shouldPreventDialogDismiss(target?: EventTarget | null) {
      if (shouldPreventDialogOutsideDismiss({ target: target ?? null })) {
        return true
      }
      if (openCount > 0) return true
      if (Date.now() < suppressUntil) return true
      return false
    },
    reset() {
      openCount = 0
      suppressUntil = 0
    },
    isSelectOpen() {
      return openCount > 0
    },
  }
}

export const preventDialogDismissIfSelectActive = preventDialogDismissIfNeeded
