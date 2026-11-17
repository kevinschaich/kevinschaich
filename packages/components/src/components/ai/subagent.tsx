// AI Elements: Subagent (https://ui.shadcn.com/docs/ai-elements/base/subagent).
// A subagent's run as a Trace line ("Running the research agent", then "Ran …"), opening to its task, model, tool
// calls and report. With the AI SDK a subagent is a tool whose execute yields the subagent's UIMessage: render the
// tool part as the Agent and output.parts as AgentTools. A yield is `output-available` with preliminary: true, so
// check preliminary before showing "Ran". Parts are named as in AI SDK Elements (Agent…).
import * as React from "react"
import { cn } from "cn"
import { CircleAlertIcon, CircleCheckIcon, LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"
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

type AgentStatus = "running" | "error" | undefined

const AgentContext = React.createContext<{ status: AgentStatus }>({ status: undefined })

function AgentStatusIcon({ status }: { status: AgentStatus }) {
  if (status === "running") {
    return <LoaderCircleIcon className="animate-spin" />
  }
  return status === "error" ? <CircleAlertIcon /> : <CircleCheckIcon />
}

type AgentProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & {
    /** "running" while the subagent works (it opens, then closes when done), "error" if it failed. */
    status?: AgentStatus
  }

function Agent({ status, open, defaultOpen, onOpenChange, children, ...props }: AgentProps) {
  const state = useTraceOpen({ open, defaultOpen, onOpenChange }, status === "running")
  return (
    <AgentContext.Provider value={{ status }}>
      <Trace data-slot="agent" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </AgentContext.Provider>
  )
}

/** "Ran the {name}", "Running the {name}" or "Failed to run the {name}", with `model` in a Badge. */
function AgentHeader({
  name,
  model,
  duration,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & {
  name: React.ReactNode
  model?: React.ReactNode
  duration?: React.ReactNode
  icon?: React.ReactNode
}) {
  const { status } = React.useContext(AgentContext)
  const verb = status === "running" ? "Running" : status === "error" ? "Failed to run" : "Ran"
  return (
    <TraceCollapsibleTrigger {...props}>
      {children ?? (
        <TraceLine status={status}>
          <TraceIcon>{icon ?? <AgentStatusIcon status={status} />}</TraceIcon>
          <TraceTitle>
            {verb} the {name}
          </TraceTitle>
          {model && (
            <Badge variant="secondary" className="shrink-0">
              {model}
            </Badge>
          )}
          {duration && <TraceDescription>{duration}</TraceDescription>}
        </TraceLine>
      )}
    </TraceCollapsibleTrigger>
  )
}

function AgentContent({ className, ...props }: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return <TraceCollapsibleContent keepMounted className={cn("flex flex-col gap-3", className)} {...props} />
}

/** The task the subagent was given. */
function AgentInstructions({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="agent-instructions" className={cn("whitespace-pre-wrap", className)} {...props} />
}

function AgentTools(props: React.ComponentProps<typeof Trace>) {
  return <Trace data-slot="agent-tools" {...props} />
}

/** One of the subagent's tool calls, like "Ran grep -rn cacheKey scripts". */
function AgentTool({
  status,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof TraceLine> & { icon?: React.ReactNode }) {
  return (
    <TraceLine data-slot="agent-tool" status={status} {...props}>
      <TraceIcon>
        {icon ?? <AgentStatusIcon status={status === "pending" ? undefined : status} />}
      </TraceIcon>
      <TraceTitle>{children}</TraceTitle>
    </TraceLine>
  )
}

/** The subagent's report. A string shows in a Code Block; anything else renders as given. */
function AgentOutput({
  output,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { output: React.ReactNode }) {
  if (typeof output !== "string") {
    return <div data-slot="agent-output" className={className} {...props}>{output}</div>
  }
  return (
    <div data-slot="agent-output" className={className} {...props}>
      <CodeBlock size="sm">
        <CodeBlockContent wrap className="max-h-64">
          {output}
        </CodeBlockContent>
      </CodeBlock>
    </div>
  )
}

/** The model and the tools it was given, as Badges. */
function AgentBadges({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap gap-1.5", className)} {...props} />
}

export {
  Agent,
  AgentHeader,
  AgentContent,
  AgentInstructions,
  AgentTools,
  AgentTool,
  AgentOutput,
  AgentBadges,
  type AgentProps,
  type AgentStatus,
}
