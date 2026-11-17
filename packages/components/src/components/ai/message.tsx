// AI Elements: Message (https://ui.shadcn.com/docs/ai-elements/base/message).
// One turn: the person's text is a muted Bubble on an end-aligned Message; the agent's reply sits on a Message with
// actions under it (ghost icon buttons with tooltips). Parts are named as in AI SDK Elements, so Message and
// MessageContent here differ from the shadcn ones in ui/message (imported below as MessageRoot and MessageBody).
// MessageResponse does not render Markdown itself (no Streamdown here): pass it rendered Markdown, or plain text.
import * as React from "react"
import { cn } from "cn"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Message as MessageRoot,
  MessageContent as MessageBody,
  MessageFooter,
} from "@/components/ui/message"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type MessageRole = "user" | "assistant" | "system"

const MessageRoleContext = React.createContext<MessageRole>("assistant")

type MessageProps = Omit<React.ComponentProps<typeof MessageRoot>, "align"> & {
  /** Who wrote it. The person's turn ("user") sits at the end, in a bubble. */
  from: MessageRole
}

function Message({ from, ...props }: MessageProps) {
  return (
    <MessageRoleContext.Provider value={from}>
      <MessageRoot
        data-from={from}
        align={from === "user" ? "end" : "start"}
        {...props}
      />
    </MessageRoleContext.Provider>
  )
}

function MessageContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof MessageBody>) {
  const from = React.useContext(MessageRoleContext)
  return (
    <MessageBody className={cn("gap-2", className)} {...props}>
      {from === "user" ? (
        <Bubble align="end" variant="muted">
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
      ) : (
        children
      )}
    </MessageBody>
  )
}

/** The reply's text. Pass rendered Markdown, or a string (kept as written, line breaks included). */
function MessageResponse({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-response"
      className={cn(
        "min-w-0 leading-relaxed",
        typeof children === "string" && "whitespace-pre-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function MessageActions(props: React.ComponentProps<typeof MessageFooter>) {
  return <MessageFooter data-slot="message-actions" {...props} />
}

function MessageAction({
  label,
  tooltip,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Names the button for screen readers, and is its tooltip unless `tooltip` is given. */
  label: string
  tooltip?: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={label} {...props} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  )
}

/** A row under the message holding the branch selector and actions side by side. */
function MessageToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-toolbar"
      className={cn("flex w-full items-center justify-between gap-4", className)}
      {...props}
    />
  )
}

type MessageBranchContextValue = {
  branch: number
  count: number
  setCount: (count: number) => void
  goTo: (branch: number) => void
}

const MessageBranchContext = React.createContext<MessageBranchContextValue | null>(null)

function useMessageBranch() {
  const context = React.useContext(MessageBranchContext)
  if (!context) {
    throw new Error("MessageBranch parts must be used within MessageBranch")
  }
  return context
}

/** Several versions of one reply (after a retry); one shows at a time. */
function MessageBranch({
  defaultBranch = 0,
  onBranchChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  defaultBranch?: number
  onBranchChange?: (branch: number) => void
}) {
  const [branch, setBranch] = React.useState(defaultBranch)
  const [count, setCount] = React.useState(0)
  const goTo = React.useCallback(
    (next: number) => {
      setBranch(next)
      onBranchChange?.(next)
    },
    [onBranchChange]
  )
  return (
    <MessageBranchContext.Provider value={{ branch, count, setCount, goTo }}>
      <div data-slot="message-branch" className={cn("grid w-full gap-2", className)} {...props} />
    </MessageBranchContext.Provider>
  )
}

/** Each child is one branch. */
function MessageBranchContent({ children }: { children?: React.ReactNode }) {
  const { branch, setCount } = useMessageBranch()
  const branches = React.Children.toArray(children)
  React.useEffect(() => setCount(branches.length), [branches.length, setCount])
  return <>{branches[Math.min(branch, Math.max(0, branches.length - 1))]}</>
}

function MessageBranchSelector({ className, ...props }: React.ComponentProps<"div">) {
  const { count } = useMessageBranch()
  if (count <= 1) {
    return null
  }
  return (
    <div
      data-slot="message-branch-selector"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function MessageBranchPrevious({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { branch, count, goTo } = useMessageBranch()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Previous version"
      disabled={count <= 1}
      onClick={() => goTo(branch > 0 ? branch - 1 : count - 1)}
      {...props}
    >
      {children ?? <ChevronLeftIcon />}
    </Button>
  )
}

function MessageBranchNext({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { branch, count, goTo } = useMessageBranch()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Next version"
      disabled={count <= 1}
      onClick={() => goTo(branch < count - 1 ? branch + 1 : 0)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </Button>
  )
}

function MessageBranchPage({ className, ...props }: React.ComponentProps<"span">) {
  const { branch, count } = useMessageBranch()
  return (
    <span
      data-slot="message-branch-page"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {branch + 1} of {count}
    </span>
  )
}

export {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
  MessageToolbar,
  MessageBranch,
  MessageBranchContent,
  MessageBranchSelector,
  MessageBranchPrevious,
  MessageBranchNext,
  MessageBranchPage,
  type MessageProps,
  type MessageRole,
}
