export type ViaCepAddress = {
  cep: string
  street: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8)
}

export function isCompleteCep(value: string) {
  return normalizeCep(value).length === 8
}

export async function fetchAddressByCep(
  cep: string,
  signal?: AbortSignal
): Promise<ViaCepAddress> {
  const normalized = normalizeCep(cep)
  if (normalized.length !== 8) {
    throw new Error("CEP incompleto")
  }

  const response = await fetch(
    `https://viacep.com.br/ws/${normalized}/json/`,
    { signal }
  )

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP")
  }

  const data = (await response.json()) as {
    erro?: boolean
    cep?: string
    logradouro?: string
    complemento?: string
    bairro?: string
    localidade?: string
    uf?: string
  }

  if (data.erro) {
    throw new Error("CEP não encontrado")
  }

  return {
    cep: formatCep(data.cep ?? normalized),
    street: data.logradouro ?? "",
    complement: data.complemento || undefined,
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  }
}
