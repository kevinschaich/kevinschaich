// AI Elements: Suggestion (https://ui.shadcn.com/docs/ai-elements/base/suggestion).
// A prompt sent without typing: a row of outline Buttons above the Prompt Input that scrolls sideways when they do
// not fit (scroll-fade-x fades the edge with more to show). The label is the message; with the AI SDK send it as is:
// sendMessage({ text: suggestion }).
import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

function Suggestions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="suggestions"
      className={cn(
        "flex scroll-fade-x scrollbar-none gap-2 overflow-x-auto overscroll-x-contain",
        className
      )}
      {...props}
    />
  )
}

function Suggestion({
  suggestion,
  onClick,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string
  onClick?: (suggestion: string) => void
}) {
  return (
    <Button
      data-slot="suggestion"
      variant="outline"
      size="sm"
      className={cn("shrink-0", className)}
      onClick={() => onClick?.(suggestion)}
      {...props}
    >
      {children ?? suggestion}
    </Button>
  )
}

export { Suggestions, Suggestion }
