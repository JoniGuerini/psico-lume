import { useMemo, useState } from "react"
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinicData } from "@/context/clinic-data-provider"
import { useTranslation } from "@/context/locale-provider"
import { buildClinicSheets, exportClinicXlsx } from "@/lib/clinic-export"
import type { ExportSheetKey, StyledSheetConfig } from "@/lib/clinic-export-xlsx"
import {
  getSheetHeaders,
  isNumericColumn,
  isWrapColumn,
  resolveCellStyle,
  resolveRowStyle,
  SHEET_COLORS,
} from "@/lib/clinic-sheet-styles"
import { cn } from "@/lib/utils"

function isDefaultSheetBackground(backgroundColor: string) {
  return (
    backgroundColor === SHEET_COLORS.card ||
    backgroundColor === SHEET_COLORS.zebra
  )
}

function SheetTable({
  config,
  emptyLabel,
  className,
}: {
  config: StyledSheetConfig
  emptyLabel: string
  className?: string
}) {
  const headers = getSheetHeaders(config.rows, emptyLabel)

  return (
    <div
      className={cn(
        "sheet-scroll min-h-0 min-w-0 flex-1 overflow-auto",
        className
      )}
    >
      <table className="w-max min-w-full border-collapse bg-card text-sm leading-snug text-foreground">
        <thead>
          <tr className="bg-sidebar">
            {headers.map((header) => (
              <th
                key={header}
                className="sticky top-0 z-20 whitespace-nowrap px-4 py-3 text-left text-xs font-medium tracking-wide text-sidebar-foreground/80 first:pl-5 last:pr-5"
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
                className="px-5 py-12 text-center text-muted-foreground"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            config.rows.map((row, rowIndex) => {
              const rowStyle = resolveRowStyle(row, config, rowIndex)
              return (
                <tr
                  key={rowIndex}
                  className="border-b border-border/60 last:border-b-0 hover:bg-accent/35"
                >
                  {headers.map((header) => {
                    const cellStyle = resolveCellStyle(
                      row,
                      config,
                      header,
                      rowStyle
                    )
                    const value = row[header] ?? ""
                    const numeric = isNumericColumn(header, config.rows)
                    const defaultBg = isDefaultSheetBackground(
                      cellStyle.backgroundColor
                    )

                    return (
                      <td
                        key={header}
                        className={cn(
                          "px-4 py-2.5 align-middle first:pl-5 last:pr-5",
                          numeric && "text-right tabular-nums",
                          isWrapColumn(header, config.wrapColumns)
                            ? "max-w-sm whitespace-normal"
                            : "whitespace-nowrap",
                          defaultBg && rowIndex % 2 === 1 && "bg-muted/25"
                        )}
                        style={{
                          backgroundColor: defaultBg
                            ? undefined
                            : cellStyle.backgroundColor,
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
  )
}

export function ClinicSheetsPage() {
  const { patients, events, sessionNotes } = useClinicData()
  const { t, locale } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const context = useMemo(() => ({ t, locale }), [t, locale])
  const sheets = useMemo(
    () => buildClinicSheets({ patients, events, sessionNotes }, context),
    [patients, events, sessionNotes, context]
  )
  const [activeSheetKey, setActiveSheetKey] = useState<ExportSheetKey>("summary")
  const resolvedSheetKey = sheets.some(
    (sheet) => sheet.sheetKey === activeSheetKey
  )
    ? activeSheetKey
    : (sheets[0]?.sheetKey ?? "summary")

  const activeConfig = useMemo(
    () =>
      sheets.find((sheet) => sheet.sheetKey === resolvedSheetKey) ?? sheets[0],
    [resolvedSheetKey, sheets]
  )

  if (!activeConfig) return null

  const rowCount = activeConfig.rows.length
  const rowLabel =
    rowCount === 1
      ? t("export.sheetsView.rows_one", { count: rowCount })
      : t("export.sheetsView.rows_other", { count: rowCount })

  async function handleExport() {
    setLoading(true)
    try {
      await exportClinicXlsx({ patients, events, sessionNotes }, context)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <FileSpreadsheet className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex flex-col gap-0.5">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                {t("export.sheetsView.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {rowLabel}
                <span className="mx-1.5 text-border">·</span>
                {t("export.sheetsView.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border bg-background/40 shadow-sm hover:bg-accent/50"
              onClick={() => setFullscreen(true)}
              aria-label={t("export.sheetsView.fullscreen")}
            >
              <Maximize2 />
              {t("export.sheetsView.fullscreen")}
            </Button>
            <Button
              type="button"
              size="sm"
              data-tour="data-export"
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Download />}
              {t("export.downloadXlsx")}
            </Button>
          </div>
        </div>

        <Tabs
          value={resolvedSheetKey}
          onValueChange={(value) => setActiveSheetKey(value as ExportSheetKey)}
        >
          <TabsList className="h-auto min-h-9 w-full flex-wrap justify-start gap-1 border border-border bg-background/40">
            {sheets.map((sheet) => (
              <TabsTrigger
                key={sheet.sheetKey}
                value={sheet.sheetKey}
                className="shrink-0"
              >
                {sheet.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
        <SheetTable
          key={resolvedSheetKey}
          config={activeConfig}
          emptyLabel={t("export.sheetsView.empty")}
        />
      </Card>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="inset-[10px] flex h-auto max-h-none w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-4 overflow-hidden rounded-3xl bg-background p-4 sm:max-w-none"
        >
          <Card className="shrink-0 gap-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <FileSpreadsheet className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <DialogTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
                    {t("export.sheetsView.title")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {rowLabel}
                    <span className="mx-1.5 text-border">·</span>
                    {t("export.sheetsView.subtitle")}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExport}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Download />}
                  {t("export.downloadXlsx")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border bg-background/40 shadow-sm hover:bg-accent/50"
                  onClick={() => setFullscreen(false)}
                >
                  <Minimize2 />
                  {t("export.sheetsView.exitFullscreen")}
                </Button>
              </div>
            </div>
            <Tabs
              value={resolvedSheetKey}
              onValueChange={(value) =>
                setActiveSheetKey(value as ExportSheetKey)
              }
            >
              <TabsList className="h-auto min-h-9 w-full flex-wrap justify-start gap-1 border border-border bg-background/40">
                {sheets.map((sheet) => (
                  <TabsTrigger
                    key={sheet.sheetKey}
                    value={sheet.sheetKey}
                    className="shrink-0"
                  >
                    {sheet.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Card>
          <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
            <SheetTable
              key={`fullscreen-${resolvedSheetKey}`}
              config={activeConfig}
              emptyLabel={t("export.sheetsView.empty")}
            />
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
