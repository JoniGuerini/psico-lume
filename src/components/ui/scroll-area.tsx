"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type ScrollBarVariant = "default" | "sidebar" | "sheet"

const scrollBarTrackClass: Record<ScrollBarVariant, string> = {
  default:
    "data-horizontal:h-2 data-horizontal:w-full data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2 data-vertical:border-l data-vertical:border-l-transparent",
  sidebar:
    "data-horizontal:h-2 data-horizontal:w-full data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2 data-vertical:border-l data-vertical:border-l-transparent",
  sheet:
    "data-horizontal:h-4 data-horizontal:w-full data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-border data-horizontal:bg-muted data-vertical:h-full data-vertical:w-3 data-vertical:border-l data-vertical:border-border data-vertical:bg-muted",
}

const scrollBarThumbClass: Record<ScrollBarVariant, string> = {
  default:
    "bg-[var(--scrollbar-thumb)] hover:bg-[var(--scrollbar-thumb-hover)]",
  sidebar: "bg-white/30 hover:bg-white/50",
  sheet:
    "rounded-md bg-muted-foreground shadow-sm hover:bg-foreground active:bg-foreground",
}

function ScrollBar({
  className,
  variant = "default",
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
  variant?: ScrollBarVariant
}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "z-20 flex touch-none select-none transition-colors",
        variant === "sheet" ? "p-1" : "p-0.5",
        scrollBarTrackClass[variant],
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full transition-colors",
          variant === "sheet" && orientation === "horizontal" && "min-h-2.5",
          variant === "sheet" && orientation === "vertical" && "min-w-2",
          scrollBarThumbClass[variant]
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

function ScrollArea({
  className,
  children,
  variant = "default",
  type = "always",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  variant?: ScrollBarVariant
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      type={type}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 [&>div]:!block [&>div]:!min-h-full"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar variant={variant} orientation="vertical" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

export { ScrollArea, ScrollBar }
