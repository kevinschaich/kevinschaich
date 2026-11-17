// AI Elements: Chat (https://ui.shadcn.com/docs/ai-elements/base/chat).
// The thread: Message turns inside a Message Scroller that keeps your place while the reply streams. Parts are named
// as in AI SDK Elements (Conversation…). Wrap each turn in a MessageScrollerItem with its messageId, and set
// scrollAnchor on the person's turns, so a new question settles near the top and the reply streams in under it.
import * as React from "react"
import { cn } from "cn"
import { DownloadIcon, MessagesSquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

type ConversationProps = React.ComponentProps<typeof MessageScroller> & {
  /** Follow the reply while the person stays at the live edge. Default true. */
  autoScroll?: boolean
}

function Conversation({ autoScroll = true, ...props }: ConversationProps) {
  return (
    <MessageScrollerProvider autoScroll={autoScroll}>
      <MessageScroller data-slot="conversation" {...props} />
    </MessageScrollerProvider>
  )
}

function ConversationContent({
  className,
  viewportClassName,
  children,
  ...props
}: React.ComponentProps<typeof MessageScrollerContent> & {
  viewportClassName?: string
}) {
  return (
    <MessageScrollerViewport className={viewportClassName}>
      <MessageScrollerContent className={cn("p-4", className)} {...props}>
        {children}
      </MessageScrollerContent>
    </MessageScrollerViewport>
  )
}

/** One turn in the thread. Set `scrollAnchor` on the person's turns. */
function ConversationItem(props: React.ComponentProps<typeof MessageScrollerItem>) {
  return <MessageScrollerItem {...props} />
}

function ConversationScrollButton(
  props: React.ComponentProps<typeof MessageScrollerButton>
) {
  return <MessageScrollerButton {...props} />
}

function ConversationEmptyState({
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Empty>, "title"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Empty className={cn("size-full", className)} {...props}>
      {children ?? (
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon ?? <MessagesSquareIcon />}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      )}
    </Empty>
  )
}

/** The shape messagesToMarkdown reads: an AI SDK UIMessage fits it. */
type ConversationMessage = {
  role: string
  parts: ReadonlyArray<{ type: string; text?: string }>
}

function messagesToMarkdown(
  messages: ReadonlyArray<ConversationMessage>,
  formatMessage: (message: ConversationMessage, index: number) => string = (
    message
  ) => {
    const text = message.parts
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("")
    const role = message.role.charAt(0).toUpperCase() + message.role.slice(1)
    return `**${role}:** ${text}`
  }
) {
  return messages.map(formatMessage).join("\n\n")
}

function ConversationDownload({
  messages,
  filename = "conversation.md",
  formatMessage,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  messages: ReadonlyArray<ConversationMessage>
  filename?: string
  formatMessage?: (message: ConversationMessage, index: number) => string
}) {
  function download() {
    const blob = new Blob([messagesToMarkdown(messages, formatMessage)], {
      type: "text/markdown",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Download conversation"
      onClick={download}
      {...props}
    >
      {children ?? <DownloadIcon />}
    </Button>
  )
}

export {
  Conversation,
  ConversationContent,
  ConversationItem,
  ConversationScrollButton,
  ConversationEmptyState,
  ConversationDownload,
  messagesToMarkdown,
  type ConversationProps,
  type ConversationMessage,
}
