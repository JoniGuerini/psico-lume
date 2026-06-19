"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type ScrollBarVariant = "default" | "sidebar"

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
        "z-20 flex touch-none p-0.5 transition-colors select-none",
        "data-horizontal:h-2 data-horizontal:w-full data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent",
        "data-vertical:h-full data-vertical:w-2 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full transition-colors",
          variant === "sidebar"
            ? "bg-white/30 hover:bg-white/50"
            : "bg-[var(--scrollbar-thumb)] hover:bg-[var(--scrollbar-thumb-hover)]"
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
