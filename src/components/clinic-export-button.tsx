import { useState } from "react"
import { FileSpreadsheet, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useClinicData } from "@/context/clinic-data-provider"
import { exportClinicXlsx } from "@/lib/clinic-export"

export function ClinicExportButton() {
  const { patients, events, sessionNotes } = useClinicData()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      await exportClinicXlsx({ patients, events, sessionNotes })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="border-border bg-card shadow-sm hover:bg-accent/50"
      disabled={loading}
      onClick={handleExport}
      aria-label="Exportar dados da clínica"
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <FileSpreadsheet />
      )}
    </Button>
  )
}
