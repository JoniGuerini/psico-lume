import { useTranslation } from "@/context/locale-provider"

export function DialogCloseLabel() {
  const { t } = useTranslation()
  return <span className="sr-only">{t("common.close")}</span>
}
