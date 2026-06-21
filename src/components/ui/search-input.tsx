import * as React from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/context/locale-provider"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  containerClassName?: string
}

function SearchInput({
  className,
  containerClassName,
  value,
  defaultValue,
  onChange,
  ...props
}: SearchInputProps) {
  const { t } = useTranslation()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    String(defaultValue ?? "")
  )

  const isControlled = value !== undefined
  const currentValue = isControlled ? String(value) : uncontrolledValue
  const showClear = currentValue.length > 0

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) {
      setUncontrolledValue(event.target.value)
    }
    onChange?.(event)
  }

  function handleClear(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!isControlled) {
      setUncontrolledValue("")
    }

    onChange?.({
      target: { value: "" },
      currentTarget: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>)

    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn("pl-9", showClear && "pr-9", className)}
        {...props}
      />
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:bg-primary/12 hover:text-primary"
          onClick={handleClear}
          aria-label={t("common.clearSearch")}
          tabIndex={-1}
        >
          <X />
        </Button>
      ) : null}
    </div>
  )
}

export { SearchInput }
