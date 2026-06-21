import * as React from "react"

import { isFormFieldFilled } from "@/lib/form-input-styles"
import { cn } from "@/lib/utils"

const emptyFieldClass =
  "border border-foreground/22 bg-card text-foreground hover:border-foreground/35"
const filledFieldClass = "border-2 border-foreground/55 bg-card text-foreground"

function Textarea({
  className,
  value,
  defaultValue,
  ...props
}: React.ComponentProps<"textarea">) {
  const filled = isFormFieldFilled(value ?? defaultValue)

  return (
    <textarea
      data-slot="textarea"
      value={value}
      defaultValue={defaultValue}
      data-filled={filled ? "true" : undefined}
      className={cn(
        "form-field flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border bg-card px-3 py-3 text-base transition-[color,box-shadow,background-color,border-color,border-width] outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        filled ? filledFieldClass : emptyFieldClass,
        className,
        filled ? filledFieldClass : emptyFieldClass
      )}
      {...props}
    />
  )
}

export { Textarea }
