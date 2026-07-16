import type { PatientStatus } from "@/data/types"

/** Cores de status na listagem/perfil (independente do i18n dos labels). */
export const patientStatusDotClass: Record<PatientStatus, string> = {
  ativo: "bg-emerald-500",
  "em-pausa": "bg-amber-500",
  "lista-espera": "bg-sky-500",
  alta: "bg-muted-foreground",
}
