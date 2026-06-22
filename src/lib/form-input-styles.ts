export function isFormFieldFilled(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === "string") return value.trim().length > 0
  if (typeof value === "number") return Number.isFinite(value)
  return String(value).trim().length > 0
}

/** Estado vazio — fundo sólido e borda visível (não parecer disabled). */
export const formFieldEmptyClass =
  "border border-foreground/22 bg-card hover:border-foreground/35 focus-visible:bg-card"

/** Estado preenchido — borda mais forte que o vazio. */
export const formFieldFilledClass =
  "border-2 border-foreground/55 bg-card text-foreground"

export const formFieldClass = `form-field ${formFieldEmptyClass}`

export const formPlaceholderClass = "placeholder:text-muted-foreground/60"
