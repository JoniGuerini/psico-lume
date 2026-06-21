import { UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTranslation } from "@/context/locale-provider"

type NoPatientsEmptyPageProps = {
  onNewPatient?: () => void
  title?: string
  description?: string
}

export function NoPatientsEmptyPage({
  onNewPatient,
  title,
  description,
}: NoPatientsEmptyPageProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-0 flex-1 w-full flex-col">
      <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="flex h-full w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/40 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background/40">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div className="flex max-w-sm flex-col gap-1">
              <p className="font-medium">
                {title ?? t("empty.noPatients.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {description ?? t("empty.noPatients.description")}
              </p>
            </div>
            {onNewPatient ? (
              <Button size="sm" onClick={onNewPatient}>
                <UserPlus />
                {t("common.newPatient")}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  )
}
