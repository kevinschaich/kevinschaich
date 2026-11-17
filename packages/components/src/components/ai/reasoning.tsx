// AI Elements: Reasoning (https://ui.shadcn.com/docs/ai-elements/base/reasoning).
// The agent's thinking as a Trace line: "Thinking" (shimmering) and open while it streams, then "Thought for 5s" and
// closed when it is done, unless the person opened or closed it. Parts are named as in AI SDK Elements. Render one
// Reasoning per AI SDK `reasoning` part; the AI SDK does not time reasoning, so pass `duration` from your own metadata.
import * as React from "react"
import { cn } from "cn"
import { BrainIcon, LoaderCircleIcon } from "lucide-react"

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { useTraceOpen } from "@/hooks/use-trace-open"

type ReasoningContextValue = {
  isStreaming: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  duration?: number
}

const ReasoningContext = React.createContext<ReasoningContextValue | null>(null)

function useReasoning() {
  const context = React.useContext(ReasoningContext)
  if (!context) {
    throw new Error("Reasoning parts must be used within Reasoning")
  }
  return context
}

type ReasoningProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & {
    isStreaming?: boolean
    /** Seconds the model thought, for "Thought for 5s". */
    duration?: number
  }

function Reasoning({
  isStreaming = false,
  open,
  defaultOpen,
  onOpenChange,
  duration,
  children,
  ...props
}: ReasoningProps) {
  const state = useTraceOpen({ open, defaultOpen, onOpenChange }, isStreaming)
  return (
    <ReasoningContext.Provider
      value={{ isStreaming, isOpen: state.open, setIsOpen: state.onOpenChange, duration }}
    >
      <Trace data-slot="reasoning" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </ReasoningContext.Provider>
  )
}

function ReasoningTrigger({
  children,
  icon,
  getThinkingMessage,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & {
  icon?: React.ReactNode
  /** The title: "Thinking" while it streams, "Thought for {duration}s" (or "Thought") after. */
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => React.ReactNode
}) {
  const { isStreaming, duration } = useReasoning()
  const title = getThinkingMessage
    ? getThinkingMessage(isStreaming, duration)
    : isStreaming
      ? "Thinking"
      : duration === undefined
        ? "Thought"
        : `Thought for ${duration}s`
  return (
    <TraceCollapsibleTrigger {...props}>
      {children ?? (
        <TraceLine status={isStreaming ? "running" : undefined}>
          <TraceIcon>
            {icon ?? (isStreaming ? <LoaderCircleIcon className="animate-spin" /> : <BrainIcon />)}
          </TraceIcon>
          <TraceTitle>{title}</TraceTitle>
        </TraceLine>
      )}
    </TraceCollapsibleTrigger>
  )
}

/** The thinking itself. A string keeps its line breaks; pass rendered Markdown for anything richer. */
function ReasoningContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent
      className={cn(typeof children === "string" && "whitespace-pre-wrap", className)}
      {...props}
    >
      {children}
    </TraceCollapsibleContent>
  )
}

export { Reasoning, ReasoningTrigger, ReasoningContent, useReasoning, type ReasoningProps }
