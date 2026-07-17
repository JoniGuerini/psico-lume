export function isFormFieldFilled(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === "string") return value.trim().length > 0
  if (typeof value === "number") return Number.isFinite(value)
  return String(value).trim().length > 0
}

/** Campo vazio — sem borda; contraste pelo fundo muted. */
export const formFieldEmptyClass =
  "border-0 bg-muted hover:bg-muted/80 focus-visible:bg-muted"

/** Campo preenchido — mesmo tratamento visual; o valor diferencia. */
export const formFieldFilledClass = "border-0 bg-muted text-foreground"

export const formFieldClass = `form-field ${formFieldEmptyClass}`

export const formPlaceholderClass = "placeholder:text-muted-foreground/45"

/** Texto de placeholder / valor ausente em triggers (select, picker). */
export const formEmptyTextClass = "text-muted-foreground/45"
