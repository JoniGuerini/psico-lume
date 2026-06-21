import { useEffect, useMemo } from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import {
  buildGlobalSearchItems,
  buildGlobalSearchQuickActions,
  groupSearchItems,
  type GlobalSearchAction,
} from "@/lib/global-search"
import { cn } from "@/lib/utils"

type GlobalSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (action: GlobalSearchAction) => void
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  onSelect,
}: GlobalSearchDialogProps) {
  const { patients, events, emails, notifications, markNotificationAsRead } =
    useClinicData()
  const { t, locale } = useTranslation()

  const quickActions = useMemo(() => buildGlobalSearchQuickActions(t), [t])

  const items = useMemo(() => {
    if (!open) return []

    return buildGlobalSearchItems({
      patients,
      events,
      emails,
      notifications,
      t,
      locale,
    })
  }, [open, patients, events, emails, notifications, t, locale])

  const groupedItems = useMemo(() => groupSearchItems(items), [items])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  function handleSelect(action: GlobalSearchAction) {
    if (action.type === "notification") {
      markNotificationAsRead(action.notificationId)
    }
    onSelect(action)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className={cn(
            "!flex max-h-[min(92vh,44rem)] min-h-0 w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-surface-dialog p-0 sm:max-w-3xl",
            "duration-75 data-open:zoom-in-100 data-closed:zoom-out-100 data-open:fade-in-0"
          )}
        >
          <DialogHeader className="shrink-0 gap-1 border-b border-border px-6 py-4 pr-14">
            <DialogTitle className="text-lg leading-snug">
              {t("search.title")}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {t("search.description")}
            </DialogDescription>
          </DialogHeader>

          <Command className="flex min-h-0 flex-1 flex-col bg-transparent">
            <div className="shrink-0 px-4 pt-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <CommandInput placeholder={t("search.placeholder")} autoFocus />
              </div>
            </div>

            <div className="shrink-0 px-4 pt-3">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleSelect(action.action)}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left shadow-sm transition-colors hover:bg-accent/50"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/40 text-foreground">
                      <action.icon className="size-4" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium leading-none">
                        {action.title}
                      </span>
                      <span className="truncate text-xs leading-snug text-muted-foreground">
                        {action.subtitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 px-4 pb-4 pt-3">
              <div className="overflow-hidden rounded-2xl border border-border bg-card pr-1 shadow-sm">
                <ScrollArea className="h-[min(18rem,40vh)]">
                  <CommandList className="overflow-visible px-1.5 py-2">
                    <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
                      {t("search.empty")}
                    </CommandEmpty>
                    {groupedItems.map(([group, groupItems], index) => (
                      <div key={group}>
                        {index > 0 ? (
                          <CommandSeparator className="mx-2 my-2 bg-border" />
                        ) : null}
                        <CommandGroup
                          heading={group}
                          className="p-0 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
                        >
                          {groupItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={`${item.title} ${item.subtitle ?? ""} ${item.value}`}
                              onSelect={() => handleSelect(item.action)}
                              className={cn(
                                "mx-1.5 items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 transition-colors",
                                "data-[selected=true]:border-sidebar-primary/40 data-[selected=true]:bg-sidebar-primary/25 data-[selected=true]:text-foreground data-[selected=true]:shadow-sm",
                                "data-[selected=true]:[&>div:first-child]:border-sidebar-primary/60 data-[selected=true]:[&>div:first-child]:bg-sidebar-primary/30 data-[selected=true]:[&>div:first-child]:text-sidebar-primary-foreground",
                                "data-[selected=true]:[&_span.font-medium]:font-semibold data-[selected=true]:[&_span.text-muted-foreground]:text-foreground/75"
                              )}
                            >
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/40 text-foreground">
                                <item.icon className="size-4" />
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                                <span className="truncate text-sm font-medium leading-none">
                                  {item.title}
                                </span>
                                {item.subtitle ? (
                                  <span className="truncate text-xs leading-snug text-muted-foreground">
                                    {item.subtitle}
                                  </span>
                                ) : null}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </div>
                    ))}
                  </CommandList>
                </ScrollArea>
              </div>
            </div>
          </Command>

          <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-border bg-card/60 px-6 py-3 text-[11px] text-muted-foreground">
            <span className="flex items-center justify-center gap-1.5">
              <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] leading-none">
                ↑↓
              </kbd>
              {t("search.navigate")}
            </span>
            <span className="flex items-center justify-center gap-1.5">
              <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] leading-none">
                ↵
              </kbd>
              {t("search.open")}
            </span>
            <span className="flex items-center justify-center gap-1.5">
              <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] leading-none">
                esc
              </kbd>
              {t("search.close")}
            </span>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}

export function useGlobalSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpen])
}
