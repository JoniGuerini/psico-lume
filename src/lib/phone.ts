export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11)
}

/** Formato BR: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX */
export function formatPhone(value: string) {
  const digits = normalizePhone(value)
  if (digits.length === 0) return ""

  if (digits.length <= 2) {
    return `(${digits}`
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isCompleteMobilePhone(value: string) {
  const digits = normalizePhone(value)
  return digits.length === 10 || digits.length === 11
}
