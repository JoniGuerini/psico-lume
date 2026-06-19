import { useEffect, useMemo } from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useClinicData } from "@/context/clinic-data-provider"
import {
  buildGlobalSearchItems,
  groupSearchItems,
  type GlobalSearchAction,
} from "@/lib/global-search"

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

  const items = useMemo(
    () =>
      buildGlobalSearchItems({
        patients,
        events,
        emails,
        notifications,
      }),
    [patients, events, emails, notifications]
  )

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
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar pacientes, sessões, e-mails..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {groupedItems.map(([group, groupItems], index) => (
          <div key={group}>
            {index > 0 ? <CommandSeparator /> : null}
            <CommandGroup heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.subtitle ?? ""} ${item.value}`}
                  onSelect={() => handleSelect(item.action)}
                >
                  <item.icon className="text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium">{item.title}</span>
                    {item.subtitle ? (
                      <span className="truncate text-xs text-muted-foreground">
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
    </CommandDialog>
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
