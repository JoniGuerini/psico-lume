import * as React from "react"

import { isFormFieldFilled } from "@/lib/form-input-styles"
import { cn } from "@/lib/utils"

/** Literal no arquivo — Tailwind só escaneia strings aqui, não em imports. */
const emptyFieldClass =
  "border border-foreground/22 bg-card text-foreground hover:border-foreground/35"
const filledFieldClass = "border-2 border-foreground/55 bg-card text-foreground"

function Input({
  className,
  type,
  value,
  defaultValue,
  ...props
}: React.ComponentProps<"input">) {
  const skipFilledState =
    type === "checkbox" ||
    type === "radio" ||
    type === "file" ||
    type === "hidden" ||
    type === "range" ||
    type === "color"

  const filled =
    !skipFilledState && isFormFieldFilled(value ?? defaultValue)

  return (
    <input
      type={type}
      data-slot="input"
      value={value}
      defaultValue={defaultValue}
      data-filled={filled ? "true" : undefined}
      className={cn(
        "form-field h-9 w-full min-w-0 rounded-3xl border bg-card px-3 py-1 text-base transition-[color,box-shadow,background-color,border-color,border-width] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        filled ? filledFieldClass : emptyFieldClass,
        className,
        filled ? filledFieldClass : emptyFieldClass
      )}
      {...props}
    />
  )
}

export { Input }
