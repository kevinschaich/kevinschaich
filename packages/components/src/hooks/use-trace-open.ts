import * as React from "react"

// Open state for the AI Elements built on Trace (src/components/ai). A line can open by itself while its work runs
// (`auto`) and close when it finishes, until the person opens or closes it: then their choice wins. `open` makes it
// fully controlled. This is the "Open State" rule from shadcn's Trace docs, shared so every pattern behaves the same.
export type TraceOpenProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function useTraceOpen(
  { open, defaultOpen, onOpenChange }: TraceOpenProps,
  auto?: boolean
) {
  const [choice, setChoice] = React.useState<boolean | undefined>(defaultOpen)
  const set = React.useCallback(
    (next: boolean) => {
      setChoice(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )
  return { open: open ?? choice ?? auto ?? false, onOpenChange: set }
}
