// AI Elements: Plan (https://ui.shadcn.com/docs/ai-elements/base/plan).
// The steps an agent decided on before it started: a Trace line ("Plan: migrate to Base UI", "2 of 5 done") that
// opens to every step, done, running or pending. Use Task instead when steps only appear as the agent works.
// Parts are named as in AI SDK Elements; PlanStep is added for the step lines.
import * as React from "react"
import { cn } from "cn"
import { CircleCheckIcon, CircleDotIcon, CircleIcon, RouteIcon } from "lucide-react"

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

const PlanContext = React.createContext<{ isStreaming: boolean }>({ isStreaming: false })

function usePlan() {
  return React.useContext(PlanContext)
}

type PlanProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & { isStreaming?: boolean }

/** Starts open (defaultOpen defaults to true). */
function Plan({
  isStreaming = false,
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  ...props
}: PlanProps) {
  const state = useTraceOpen({ open, defaultOpen, onOpenChange })
  return (
    <PlanContext.Provider value={{ isStreaming }}>
      <Trace data-slot="plan" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </PlanContext.Provider>
  )
}

/** The plan's line: put PlanTitle and PlanDescription in it. `action` sits beside the line, not inside its button. */
function PlanHeader({
  icon,
  action,
  children,
  className,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & {
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  const { isStreaming } = usePlan()
  const trigger = (
    <TraceCollapsibleTrigger className={action ? undefined : className} {...props}>
      <TraceLine status={isStreaming ? "running" : undefined}>
        <TraceIcon>{icon ?? <RouteIcon />}</TraceIcon>
        {children}
      </TraceLine>
    </TraceCollapsibleTrigger>
  )
  if (!action) {
    return trigger
  }
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {trigger}
      {action}
    </div>
  )
}

function PlanTitle(props: React.ComponentProps<typeof TraceTitle>) {
  return <TraceTitle {...props} />
}

/** Progress, like "2 of 4 done". */
function PlanDescription(props: React.ComponentProps<typeof TraceDescription>) {
  return <TraceDescription {...props} />
}

/** The whole line opens the plan, so the trigger is only its children. */
function PlanTrigger({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function PlanAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="plan-action" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />
}

function PlanContent({
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent {...props}>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  )
}

/** One step. "running" shimmers only while the plan streams. */
function PlanStep({
  status = "pending",
  children,
  ...props
}: Omit<React.ComponentProps<typeof TraceLine>, "status"> & {
  status?: "done" | "running" | "pending"
}) {
  const { isStreaming } = usePlan()
  return (
    <TraceLine
      status={status === "pending" ? "pending" : status === "running" && isStreaming ? "running" : undefined}
      {...props}
    >
      <TraceIcon>
        {status === "done" ? <CircleCheckIcon /> : status === "running" ? <CircleDotIcon /> : <CircleIcon />}
      </TraceIcon>
      <TraceTitle>{children}</TraceTitle>
    </TraceLine>
  )
}

function PlanFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="plan-footer" className={cn("flex items-center gap-2", className)} {...props} />
}

export {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanTrigger,
  PlanAction,
  PlanContent,
  PlanStep,
  PlanFooter,
  usePlan,
  type PlanProps,
}
