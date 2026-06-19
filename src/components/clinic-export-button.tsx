import { useState } from "react"
import { FileSpreadsheet, Loader2, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClinicData } from "@/context/clinic-data-provider"
import { exportClinicXlsx } from "@/lib/clinic-export"

type ClinicExportButtonProps = {
  onViewSheets?: () => void
}

export function ClinicExportButton({ onViewSheets }: ClinicExportButtonProps) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border bg-card shadow-sm hover:bg-accent/50"
          disabled={loading}
          aria-label="Dados da clínica"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <FileSpreadsheet />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onViewSheets ? (
          <DropdownMenuItem onClick={onViewSheets}>
            <Table2 />
            Ver planilha
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={handleExport} disabled={loading}>
          <FileSpreadsheet />
          Baixar XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
