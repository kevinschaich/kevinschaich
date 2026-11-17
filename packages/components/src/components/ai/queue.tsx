// AI Elements: Queue (https://ui.shadcn.com/docs/ai-elements/base/queue).
// The agent's todo list as Trace sections ("2 to do", "1 completed"), each opening to its todos. With the AI SDK the
// agent writes todos with a tool (writeTodos): render the last call whose input has finished streaming. Map status:
// pending -> CircleIcon; in_progress -> CircleDotIcon, "running" only while the chat streams; completed -> check.
// Parts are named as in AI SDK Elements.
import * as React from "react"
import { cn } from "cn"
import { CircleCheckIcon, CircleDotIcon, CircleIcon, FileIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

function Queue(props: React.ComponentProps<typeof Trace>) {
  return <Trace data-slot="queue" {...props} />
}

/** Starts open (defaultOpen defaults to true). */
function QueueSection({
  defaultOpen = true,
  ...props
}: React.ComponentProps<typeof TraceCollapsible>) {
  return <TraceCollapsible defaultOpen={defaultOpen} {...props} />
}

function QueueSectionTrigger(props: React.ComponentProps<typeof TraceCollapsibleTrigger>) {
  return <TraceCollapsibleTrigger {...props} />
}

/** "2 to do": the count, then the label. */
function QueueSectionLabel({
  icon,
  count,
  label,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TraceLine>, "children"> & {
  icon?: React.ReactNode
  count?: number
  label?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <TraceLine {...props}>
      {icon && <TraceIcon>{icon}</TraceIcon>}
      <TraceTitle>
        {children ?? (
          <>
            {count !== undefined && `${count} `}
            {label}
          </>
        )}
      </TraceTitle>
    </TraceLine>
  )
}

function QueueSectionContent(props: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return <TraceCollapsibleContent keepMounted {...props} />
}

function QueueList(props: React.ComponentProps<typeof Trace>) {
  return <Trace data-slot="queue-list" {...props} />
}

function QueueItem(props: React.ComponentProps<typeof TraceLine>) {
  return <TraceLine data-slot="queue-item" {...props} />
}

type QueueTodoStatus = "pending" | "in_progress" | "completed"

function QueueItemIndicator({
  status,
  completed,
  children,
  ...props
}: React.ComponentProps<typeof TraceIcon> & {
  status?: QueueTodoStatus
  /** Shorthand for status="completed". */
  completed?: boolean
}) {
  const resolved = status ?? (completed ? "completed" : "pending")
  return (
    <TraceIcon {...props}>
      {children ??
        (resolved === "completed" ? (
          <CircleCheckIcon />
        ) : resolved === "in_progress" ? (
          <CircleDotIcon />
        ) : (
          <CircleIcon />
        ))}
    </TraceIcon>
  )
}

function QueueItemContent(props: React.ComponentProps<typeof TraceTitle>) {
  return <TraceTitle {...props} />
}

function QueueItemDescription(props: React.ComponentProps<typeof TraceDescription>) {
  return <TraceDescription {...props} />
}

function QueueItemActions({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="queue-item-actions" className={cn("ml-auto flex shrink-0 items-center gap-1", className)} {...props} />
}

function QueueItemAction(props: React.ComponentProps<typeof Button>) {
  return <Button variant="ghost" size="icon-xs" {...props} />
}

function QueueItemAttachment({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="queue-item-attachment" className={cn("flex flex-wrap gap-1.5", className)} {...props} />
}

function QueueItemImage({ className, alt = "", ...props }: React.ComponentProps<"img">) {
  return <img alt={alt} className={cn("size-8 rounded-sm border object-cover", className)} {...props} />
}

function QueueItemFile({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex max-w-48 items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs [&_svg]:size-3", className)}
      {...props}
    >
      <FileIcon />
      <span className="truncate">{children}</span>
    </span>
  )
}

export {
  Queue,
  QueueSection,
  QueueSectionTrigger,
  QueueSectionLabel,
  QueueSectionContent,
  QueueList,
  QueueItem,
  QueueItemIndicator,
  QueueItemContent,
  QueueItemDescription,
  QueueItemActions,
  QueueItemAction,
  QueueItemAttachment,
  QueueItemImage,
  QueueItemFile,
  type QueueTodoStatus,
}
