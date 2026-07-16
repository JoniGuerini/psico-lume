import { useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import { useTranslation } from "@/context/locale-provider"
import { notifySelectOpenChange } from "@/lib/dialog-outside-guard"
import { sessionFieldClass } from "@/lib/session-scheduling"
import { cn } from "@/lib/utils"

type PatientNamePickerProps = {
  id: string
  value: string
  names: string[]
  onChange: (name: string) => void
  onOpenChange?: (open: boolean) => void
  className?: string
  triggerClassName?: string
}

export function PatientNamePicker({
  id,
  value,
  names,
  onChange,
  onOpenChange,
  className,
  triggerClassName,
}: PatientNamePickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return names
    return names.filter((name) =>
      name.toLocaleLowerCase().includes(normalized)
    )
  }, [names, query])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    notifySelectOpenChange(nextOpen)
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      setQuery("")
    }
  }

  function handleSelect(name: string) {
    onChange(name)
    handleOpenChange(false)
  }

  const hasValue = value.trim().length > 0

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs">
        {t("sessionForm.patient")}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              "flex h-9 w-full cursor-pointer items-center justify-between gap-1.5 rounded-3xl px-3 py-2 text-sm whitespace-nowrap outline-none transition-[color,box-shadow,background-color,border-color,border-width] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
              sessionFieldClass,
              hasValue &&
                "border-2 border-foreground/55 bg-card text-foreground",
              !hasValue && "text-muted-foreground/60",
              triggerClassName
            )}
          >
            <span className="truncate">
              {hasValue ? value : t("sessionForm.selectPatient")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) gap-0 p-0"
        >
          <div className="border-b border-border p-2">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("sessionForm.searchPatient")}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div
            className="flex max-h-48 flex-col gap-0.5 overflow-y-auto p-1.5"
            role="listbox"
            aria-label={t("sessionForm.patient")}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {t("common.noResults")}
              </p>
            ) : (
              filtered.map((name) => {
                const selected = name === value
                return (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(name)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors",
                      selected
                        ? "bg-primary/12 text-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="truncate">{name}</span>
                    {selected ? (
                      <Check
                        className="size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
