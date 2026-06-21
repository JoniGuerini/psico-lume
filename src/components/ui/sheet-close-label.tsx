import { useTranslation } from "@/context/locale-provider"

export function SheetCloseLabel() {
  const { t } = useTranslation()
  return <span className="sr-only">{t("common.close")}</span>
}
