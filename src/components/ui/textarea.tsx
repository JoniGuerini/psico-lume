import * as React from "react"

import { isFormFieldFilled } from "@/lib/form-input-styles"
import { cn } from "@/lib/utils"

const emptyFieldClass = "border-0 bg-muted text-foreground hover:bg-muted/80"
const filledFieldClass = "border-0 bg-muted text-foreground"

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
        "form-field flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border-0 bg-muted px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/45 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40",
        filled ? filledFieldClass : emptyFieldClass,
        className,
        filled ? filledFieldClass : emptyFieldClass
      )}
      {...props}
    />
  )
}

export { Textarea }
