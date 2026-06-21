import { ptBR } from "@/i18n/messages/pt-BR"

export type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>
}

export type Messages = DeepString<typeof ptBR>
