import { useEffect, useMemo, useState } from "react"
import { FileSpreadsheet } from "lucide-react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { buildClinicSheets } from "@/lib/clinic-export"
import type { ExportSheetKey, StyledSheetConfig } from "@/lib/clinic-export-xlsx"
import {
  getSheetHeaders,
  isNumericColumn,
  isWrapColumn,
  resolveCellStyle,
  resolveRowStyle,
  SHEET_COLORS,
} from "@/lib/clinic-sheet-styles"
import { lumeSurfaces } from "@/lib/design-system"
import { cn } from "@/lib/utils"

function SheetTabs({
  sheets,
  active,
  onChange,
}: {
  sheets: StyledSheetConfig[]
  active: ExportSheetKey
  onChange: (key: ExportSheetKey) => void
}) {
  return (
    <div className={lumeSurfaces.sheetTabBar}>
      <div className="flex min-w-max items-end px-1 pt-1">
        {sheets.map((sheet) => {
          const selected = sheet.sheetKey === active
          return (
            <button
              key={sheet.sheetKey}
              type="button"
              onClick={() => onChange(sheet.sheetKey)}
              className={cn(
                "relative shrink-0 rounded-t-md border border-b-0 px-3 py-1.5 text-xs font-medium transition-colors",
                selected ? lumeSurfaces.sheetTabActive : lumeSurfaces.sheetTabIdle
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

function SheetTable({
  config,
  emptyLabel,
}: {
  config: StyledSheetConfig
  emptyLabel: string
}) {
  const headers = getSheetHeaders(config.rows, emptyLabel)

  return (
    <ScrollArea className="min-h-0 min-w-0 flex-1">
      <div className="inline-block w-max min-w-full pb-1 pr-10">
        <table className="w-max border-collapse text-[13px] leading-snug text-foreground">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="sticky top-0 z-20 whitespace-nowrap border border-surface-sheet-border px-2.5 py-2 text-left text-[11px] font-bold text-primary-foreground"
                style={{ backgroundColor: SHEET_COLORS.headerBg }}
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
                className="border border-surface-sheet-border px-4 py-8 text-center text-muted-foreground"
              >
                {emptyLabel}
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
                          "border border-surface-sheet-border px-2.5 py-1.5 align-top",
                          numeric && "text-right tabular-nums",
                          isWrapColumn(header, config.wrapColumns)
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
      </div>
      <ScrollBar orientation="horizontal" variant="sheet" />
      <ScrollBar orientation="vertical" variant="sheet" />
    </ScrollArea>
  )
}

export function ClinicSheetsPage() {
  const { patients, events, sessionNotes } = useClinicData()
  const { t, locale } = useTranslation()
  const context = useMemo(() => ({ t, locale }), [t, locale])
  const sheets = useMemo(
    () => buildClinicSheets({ patients, events, sessionNotes }, context),
    [patients, events, sessionNotes, context]
  )
  const [activeSheetKey, setActiveSheetKey] = useState<ExportSheetKey>("summary")

  useEffect(() => {
    if (!sheets.some((sheet) => sheet.sheetKey === activeSheetKey)) {
      setActiveSheetKey(sheets[0]?.sheetKey ?? "summary")
    }
  }, [sheets, activeSheetKey])

  const activeConfig = useMemo(
    () =>
      sheets.find((sheet) => sheet.sheetKey === activeSheetKey) ?? sheets[0],
    [activeSheetKey, sheets]
  )

  if (!activeConfig) return null

  const rowCount = activeConfig.rows.length
  const rowLabel =
    rowCount === 1
      ? t("export.sheetsView.rows_one", { count: rowCount })
      : t("export.sheetsView.rows_other", { count: rowCount })

  return (
    <div className={lumeSurfaces.sheetRoot}>
      <div className={lumeSurfaces.sheetToolbar}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileSpreadsheet className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-foreground">
            {t("export.sheetsView.title")}
          </p>
          <p className="text-xs text-muted-foreground">
            {rowLabel} · {t("export.sheetsView.subtitle")}
          </p>
        </div>
      </div>

      <SheetTabs
        sheets={sheets}
        active={activeSheetKey}
        onChange={setActiveSheetKey}
      />
      <SheetTable
        config={activeConfig}
        emptyLabel={t("export.sheetsView.empty")}
      />
    </div>
  )
}
