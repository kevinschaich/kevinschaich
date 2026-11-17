// AI Elements: Task (https://ui.shadcn.com/docs/ai-elements/base/task).
// Work whose steps come from the work itself: a Trace line titled in the present tense while it runs ("Updating the
// page metadata") and the past tense when done, opening to the steps taken. Keep the running task open, close each
// when it is done. Use Plan instead when every step is known up front. Parts are named as in AI SDK Elements.
import * as React from "react"
import { cn } from "cn"
import { CircleAlertIcon, CircleCheckIcon, LoaderCircleIcon } from "lucide-react"

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

type TaskStatus = "running" | "error" | undefined

const TaskContext = React.createContext<{ status: TaskStatus }>({ status: undefined })

type TaskProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & {
    /** "running" opens the task until it finishes; "error" marks it failed. */
    status?: TaskStatus
  }

function Task({ status, open, defaultOpen, onOpenChange, children, ...props }: TaskProps) {
  const state = useTraceOpen({ open, defaultOpen, onOpenChange }, status === "running")
  return (
    <TaskContext.Provider value={{ status }}>
      <Trace data-slot="task" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </TaskContext.Provider>
  )
}

function TaskTrigger({
  title,
  icon,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TraceCollapsibleTrigger>, "title"> & {
  title: React.ReactNode
  /** Defaults to a spinner, alert or check from the task's status; pass null for none. */
  icon?: React.ReactNode
}) {
  const { status } = React.useContext(TaskContext)
  const defaultIcon =
    status === "running" ? (
      <LoaderCircleIcon className="animate-spin" />
    ) : status === "error" ? (
      <CircleAlertIcon />
    ) : (
      <CircleCheckIcon />
    )
  const shown = icon === undefined ? defaultIcon : icon
  return (
    <TraceCollapsibleTrigger {...props}>
      {children ?? (
        <TraceLine status={status}>
          {shown && <TraceIcon>{shown}</TraceIcon>}
          <TraceTitle>{title}</TraceTitle>
        </TraceLine>
      )}
    </TraceCollapsibleTrigger>
  )
}

function TaskContent({ children, ...props }: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent keepMounted {...props}>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  )
}

function TaskItem({
  icon,
  children,
  ...props
}: React.ComponentProps<typeof TraceLine> & { icon?: React.ReactNode }) {
  return (
    <TraceLine data-slot="task-item" {...props}>
      {icon && <TraceIcon>{icon}</TraceIcon>}
      <TraceTitle>{children}</TraceTitle>
    </TraceLine>
  )
}

/** A file named inside a step, like "Read <TaskItemFile>app/page.tsx</TaskItemFile>". */
function TaskItemFile({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="task-item-file"
      className={cn("inline-flex items-center gap-1 rounded-sm bg-muted px-1 py-0.5 font-mono text-xs text-foreground [&_svg]:size-3", className)}
      {...props}
    />
  )
}

export { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile, type TaskProps, type TaskStatus }
