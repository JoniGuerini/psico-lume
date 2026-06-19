import { useMemo, useState } from "react"
import { FileSpreadsheet } from "lucide-react"

import { useClinicData } from "@/context/clinic-data-provider"
import { buildClinicSheets } from "@/lib/clinic-export"
import type { StyledSheetConfig } from "@/lib/clinic-export-xlsx"
import {
  getSheetHeaders,
  isNumericColumn,
  isWrapColumn,
  resolveCellStyle,
  resolveRowStyle,
  SHEET_COLORS,
} from "@/lib/clinic-sheet-styles"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

function SheetTabs({
  sheets,
  active,
  onChange,
}: {
  sheets: StyledSheetConfig[]
  active: string
  onChange: (name: string) => void
}) {
  return (
    <div className="shrink-0 overflow-x-auto border-b border-[#E5E0D5] bg-[#F8F6F0]">
      <div className="flex min-w-max items-end px-1 pt-1">
        {sheets.map((sheet) => {
          const selected = sheet.name === active
          return (
            <button
              key={sheet.name}
              type="button"
              onClick={() => onChange(sheet.name)}
              className={cn(
                "relative shrink-0 rounded-t-md border border-b-0 px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "z-10 border-[#E5E0D5] bg-white text-[#1B3A5C] shadow-sm"
                  : "border-transparent bg-[#EDE9DF] text-[#1B3A5C]/70 hover:bg-[#E5E0D5]/60 hover:text-[#1B3A5C]"
              )}
            >
              {sheet.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SheetTable({ config }: { config: StyledSheetConfig }) {
  const headers = getSheetHeaders(config.rows)

  return (
    <ScrollArea className="min-h-0 min-w-0 flex-1">
      <table className="w-max border-collapse text-[13px] leading-snug text-[#1B3A5C]">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="sticky top-0 z-20 whitespace-nowrap border border-[#E5E0D5] px-2.5 py-2 text-left text-[11px] font-bold"
                style={{
                  backgroundColor: SHEET_COLORS.headerBg,
                  color: SHEET_COLORS.headerText,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config.rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="border border-[#E5E0D5] px-4 py-8 text-center text-muted-foreground"
              >
                Nenhum registro
              </td>
            </tr>
          ) : (
            config.rows.map((row, rowIndex) => {
              const rowStyle = resolveRowStyle(row, config, rowIndex)
              return (
                <tr key={rowIndex}>
                  {headers.map((header) => {
                    const cellStyle = resolveCellStyle(
                      row,
                      config,
                      header,
                      rowStyle
                    )
                    const value = row[header] ?? ""
                    const numeric = isNumericColumn(header, config.rows)

                    return (
                      <td
                        key={header}
                        className={cn(
                          "border border-[#E5E0D5] px-2.5 py-1.5 align-top",
                          numeric && "text-right tabular-nums",
                          isWrapColumn(header)
                            ? "max-w-xs whitespace-normal"
                            : "whitespace-nowrap"
                        )}
                        style={{
                          backgroundColor: cellStyle.backgroundColor,
                          color: cellStyle.color,
                          fontWeight: cellStyle.fontWeight,
                          textDecoration: cellStyle.textDecoration,
                        }}
                      >
                        {value}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  )
}

export function ClinicSheetsPage() {
  const { patients, events, sessionNotes } = useClinicData()
  const sheets = useMemo(
    () => buildClinicSheets({ patients, events, sessionNotes }),
    [patients, events, sessionNotes]
  )
  const [activeSheet, setActiveSheet] = useState(sheets[0]?.name ?? "Resumo")

  const activeConfig = useMemo(
    () => sheets.find((sheet) => sheet.name === activeSheet) ?? sheets[0],
    [activeSheet, sheets]
  )

  if (!activeConfig) return null

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#E5E0D5] bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E5E0D5] bg-[#F8F6F0] px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3A5C]/10">
          <FileSpreadsheet className="size-4 text-[#1B3A5C]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-[#1B3A5C]">
            Visão em planilha
          </p>
          <p className="text-xs text-[#1B3A5C]/65">
            {activeConfig.rows.length}{" "}
            {activeConfig.rows.length === 1 ? "linha" : "linhas"} · mesmas abas
            e cores do export XLSX
          </p>
        </div>
      </div>

      <SheetTabs
        sheets={sheets}
        active={activeSheet}
        onChange={setActiveSheet}
      />
      <SheetTable config={activeConfig} />
    </div>
  )
}
