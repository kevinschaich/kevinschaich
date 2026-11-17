// AI Elements: Chain of Thought (https://ui.shadcn.com/docs/ai-elements/base/chain-of-thought).
// A summary line ("Researched in 3 steps") that expands into the steps an agent took, built on Trace and Badge.
// Parts are named as in AI SDK Elements, rebuilt the way shadcn's page builds them.
import * as React from "react"
import { cn } from "cn"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleIcon,
  LoaderCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { useTraceOpen } from "@/hooks/use-trace-open"

type TraceStatus = "running" | "error" | "pending" | undefined

const ChainOfThoughtContext = React.createContext<{ isStreaming: boolean }>({
  isStreaming: false,
})

function ChainOfThoughtStatusIcon({ status }: { status?: TraceStatus }) {
  if (status === "running") {
    return <LoaderCircleIcon className="animate-spin" />
  }
  if (status === "pending") {
    return <CircleIcon />
  }
  return status === "error" ? <CircleAlertIcon /> : <CircleCheckIcon />
}

type ChainOfThoughtProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue"
> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & {
    /** True while the steps run: the summary opens, then closes when they finish. */
    isStreaming?: boolean
  }

function ChainOfThought({
  open,
  defaultOpen,
  onOpenChange,
  isStreaming = false,
  children,
  ...props
}: ChainOfThoughtProps) {
  const state = useTraceOpen({ open, defaultOpen, onOpenChange }, isStreaming)
  return (
    <ChainOfThoughtContext.Provider value={{ isStreaming }}>
      <Trace data-slot="chain-of-thought" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </ChainOfThoughtContext.Provider>
  )
}

function ChainOfThoughtHeader({
  status,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & {
  /** Defaults to "running" while the chain streams. */
  status?: "running" | "error"
  icon?: React.ReactNode
}) {
  const { isStreaming } = React.useContext(ChainOfThoughtContext)
  const resolved = status ?? (isStreaming ? "running" : undefined)
  return (
    <TraceCollapsibleTrigger {...props}>
      <TraceLine status={resolved}>
        <TraceIcon>{icon ?? <ChainOfThoughtStatusIcon status={resolved} />}</TraceIcon>
        <TraceTitle>{children ?? (resolved === "running" ? "Thinking" : "Chain of Thought")}</TraceTitle>
      </TraceLine>
    </TraceCollapsibleTrigger>
  )
}

function ChainOfThoughtContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent keepMounted className={className} {...props}>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  )
}

type ChainOfThoughtStepProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** "complete" (the default) shows no status, "active" runs, "pending" waits. */
  status?: "complete" | "active" | "pending" | "error"
  icon?: React.ReactNode
  label: React.ReactNode
  description?: React.ReactNode
  /** Detail under the step (search results, a log). Makes the step collapsible. */
  children?: React.ReactNode
  defaultOpen?: boolean
}

function ChainOfThoughtStep({
  status = "complete",
  icon,
  label,
  description,
  children,
  defaultOpen,
  ...props
}: ChainOfThoughtStepProps) {
  const traceStatus: TraceStatus =
    status === "active" ? "running" : status === "complete" ? undefined : status
  const line = (
    <TraceLine data-slot="chain-of-thought-step" status={traceStatus} {...props}>
      <TraceIcon>{icon ?? <ChainOfThoughtStatusIcon status={traceStatus} />}</TraceIcon>
      <TraceTitle>{label}</TraceTitle>
      {description && <TraceDescription>{description}</TraceDescription>}
    </TraceLine>
  )
  if (!children) {
    return line
  }
  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>{children}</TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

function ChainOfThoughtSearchResults({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chain-of-thought-search-results"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  )
}

function ChainOfThoughtSearchResult(props: React.ComponentProps<typeof Badge>) {
  return <Badge variant="secondary" {...props} />
}

function ChainOfThoughtImage({
  caption,
  className,
  children,
  ...props
}: React.ComponentProps<"figure"> & { caption?: React.ReactNode }) {
  return (
    <figure
      data-slot="chain-of-thought-image"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <div className="overflow-hidden rounded-md bg-muted">{children}</div>
      {caption && <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
  type ChainOfThoughtProps,
  type ChainOfThoughtStepProps,
}
