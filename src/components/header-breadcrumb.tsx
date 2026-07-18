import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type HeaderBreadcrumbItem = {
  label: string
  onClick?: () => void
}

export function HeaderBreadcrumb({
  items,
  className,
}: {
  items: HeaderBreadcrumbItem[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("min-w-0 flex-1", className)}
    >
      <ol className="flex min-w-0 items-center gap-1.5 font-heading text-base font-medium">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              {isLast || !item.onClick ? (
                <span
                  className={cn(
                    "min-w-0 truncate",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
