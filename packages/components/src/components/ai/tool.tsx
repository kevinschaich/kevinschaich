// AI Elements: Tool (https://ui.shadcn.com/docs/ai-elements/base/tool).
// One tool call as a Trace line: "Running …", "Ran …", "Failed to run …" or "Denied …", opening to its input and
// output in Code Blocks. Parts are named as in AI SDK Elements. ToolPart is structural, so an AI SDK tool part (or a
// dynamic-tool part) fits it without this package depending on the AI SDK.
import * as React from "react"
import { cn } from "cn"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleSlashIcon,
  ClockIcon,
  LoaderCircleIcon,
  WrenchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"
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

type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"

/** A tool call: an AI SDK `tool-<name>` or `dynamic-tool` part fits this shape. */
type ToolPart = {
  type: string
  state: ToolState
  toolName?: string
  toolCallId?: string
  input?: unknown
  output?: unknown
  errorText?: string
  approval?: { id: string; approved?: boolean; reason?: string }
  preliminary?: boolean
}

/** The tool's name: `toolName` on a dynamic tool, else the part type without its `tool-` prefix. */
function getToolName(part: Pick<ToolPart, "type" | "toolName">) {
  return part.toolName ?? part.type.replace(/^tool-/, "")
}

/** Maps a tool state to Trace's line status and the verb its title starts with. */
function getToolStatus(state: ToolState, approval?: ToolPart["approval"]) {
  if (
    state === "output-denied" ||
    (state === "approval-responded" && approval?.approved === false)
  ) {
    return { status: undefined, verb: "Denied" } as const
  }
  if (state === "output-available") {
    return { status: undefined, verb: "Ran" } as const
  }
  if (state === "output-error") {
    return { status: "error", verb: "Failed to run" } as const
  }
  return { status: "running", verb: "Running" } as const
}

const statusLabels: Record<ToolState, string> = {
  "input-streaming": "Pending",
  "input-available": "Running",
  "approval-requested": "Awaiting Approval",
  "approval-responded": "Responded",
  "output-available": "Completed",
  "output-error": "Error",
  "output-denied": "Denied",
}

const statusIcons: Record<ToolState, React.ReactNode> = {
  "input-streaming": <CircleIcon />,
  "input-available": <ClockIcon className="animate-pulse" />,
  "approval-requested": <ClockIcon />,
  "approval-responded": <CircleCheckIcon />,
  "output-available": <CircleCheckIcon />,
  "output-error": <CircleAlertIcon />,
  "output-denied": <CircleSlashIcon />,
}

/** A Badge naming the state. Trace lines show state through their status instead; this stays for other layouts. */
function getStatusBadge(status: ToolState) {
  return (
    <Badge variant={status === "output-error" ? "destructive" : "secondary"}>
      {statusIcons[status]}
      {statusLabels[status]}
    </Badge>
  )
}

type ToolProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }

function Tool({ open, defaultOpen, onOpenChange, children, ...props }: ToolProps) {
  const state = useTraceOpen({ open, defaultOpen, onOpenChange })
  return (
    <Trace data-slot="tool" {...props}>
      <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
        {children}
      </TraceCollapsible>
    </Trace>
  )
}

type ToolHeaderProps = Omit<
  React.ComponentProps<typeof TraceCollapsibleTrigger>,
  "title" | "type"
> & {
  type: ToolPart["type"]
  state: ToolState
  toolName?: string
  approval?: ToolPart["approval"]
  /** What the tool did, after the verb: "Ran {title}". Defaults to the tool's name. */
  title?: React.ReactNode
  icon?: React.ReactNode
}

function ToolHeader({
  type,
  state,
  toolName,
  approval,
  title,
  icon,
  ...props
}: ToolHeaderProps) {
  const { status, verb } = getToolStatus(state, approval)
  return (
    <TraceCollapsibleTrigger {...props}>
      <TraceLine status={status}>
        <TraceIcon>
          {icon ??
            (status === "running" ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <WrenchIcon />
            ))}
        </TraceIcon>
        <TraceTitle>
          {verb} {title ?? getToolName({ type, toolName })}
        </TraceTitle>
      </TraceLine>
    </TraceCollapsibleTrigger>
  )
}

function ToolContent({
  className,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function formatValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2)
}

function ToolInput({
  input,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CodeBlock>, "children"> & {
  input: unknown
}) {
  if (input === undefined) {
    return null
  }
  return (
    <CodeBlock data-slot="tool-input" size="sm" className={className} {...props}>
      <CodeBlockContent wrap className="max-h-64">
        {formatValue(input)}
      </CodeBlockContent>
    </CodeBlock>
  )
}

function ToolOutput({
  output,
  errorText,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CodeBlock>, "children"> & {
  output?: unknown
  errorText?: string
}) {
  if (!errorText && output === undefined) {
    return null
  }
  if (!errorText && React.isValidElement(output)) {
    return <div data-slot="tool-output">{output}</div>
  }
  return (
    <CodeBlock
      data-slot="tool-output"
      size="sm"
      variant={errorText ? "destructive" : "default"}
      className={className}
      {...props}
    >
      <CodeBlockContent wrap className="max-h-64">
        {errorText ?? formatValue(output)}
      </CodeBlockContent>
    </CodeBlock>
  )
}

export {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  getStatusBadge,
  getToolName,
  getToolStatus,
  type ToolPart,
  type ToolState,
  type ToolProps,
  type ToolHeaderProps,
}
