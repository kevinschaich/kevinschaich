// AI Elements: Context (https://ui.shadcn.com/docs/ai-elements/base/context).
// How much of the model's context window the conversation has used: a Hover Card on an outline Button ("7% context")
// with a Progress bar and the token breakdown. With the AI SDK, send part.totalUsage as message metadata on "finish";
// the context window (maxTokens) is not sent, so set it from the model you use.
import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"

/** Token counts; an AI SDK LanguageModelUsage fits this shape. */
type ContextUsage = {
  inputTokens?: number
  outputTokens?: number
  reasoningTokens?: number
  cachedInputTokens?: number
  totalTokens?: number
}

type ContextValue = {
  usedTokens: number
  maxTokens: number
  usage?: ContextUsage
  modelId?: string
}

const ContextContext = React.createContext<ContextValue | null>(null)

function useContextValue() {
  const context = React.useContext(ContextContext)
  if (!context) {
    throw new Error("Context parts must be used within Context")
  }
  return context
}

function formatTokens(value: number) {
  if (value < 1000) {
    return String(value)
  }
  if (value < 1_000_000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
  }
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
}

function percentUsed({ usedTokens, maxTokens }: ContextValue) {
  return maxTokens > 0 ? Math.min(100, Math.round((usedTokens / maxTokens) * 100)) : 0
}

type ContextProps = React.ComponentProps<typeof HoverCard> & ContextValue

function Context({ usedTokens, maxTokens, usage, modelId, ...props }: ContextProps) {
  return (
    <ContextContext.Provider value={{ usedTokens, maxTokens, usage, modelId }}>
      <HoverCard {...props} />
    </ContextContext.Provider>
  )
}

function ContextTrigger({
  children,
  ...props
}: React.ComponentProps<typeof HoverCardTrigger>) {
  const value = useContextValue()
  return (
    <HoverCardTrigger
      delay={10}
      closeDelay={100}
      render={<Button variant="outline" size="sm" />}
      {...props}
    >
      {children ?? `${percentUsed(value)}% context`}
    </HoverCardTrigger>
  )
}

function ContextContent({
  className,
  ...props
}: React.ComponentProps<typeof HoverCardContent>) {
  return (
    <HoverCardContent
      data-slot="context-content"
      className={cn("flex w-64 flex-col gap-3", className)}
      {...props}
    />
  )
}

function ContextContentHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const value = useContextValue()
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">Context</span>
            <span className="text-muted-foreground">
              {formatTokens(value.usedTokens)} / {formatTokens(value.maxTokens)}
            </span>
          </div>
          <Progress value={percentUsed(value)} aria-label="Context used" />
        </>
      )}
    </div>
  )
}

function ContextContentBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 text-sm", className)} {...props} />
}

function ContextContentFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex justify-between gap-3 border-t pt-3 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function UsageRow({
  label,
  tokens,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: string; tokens?: number }) {
  if (!children && !tokens) {
    return null
  }
  return (
    <div className={cn("flex justify-between gap-3", className)} {...props}>
      {children ?? (
        <>
          <span className="text-muted-foreground">{label}</span>
          <span>{formatTokens(tokens ?? 0)}</span>
        </>
      )}
    </div>
  )
}

type UsageProps = React.ComponentProps<"div">

function ContextInputUsage(props: UsageProps) {
  return <UsageRow label="Input" tokens={useContextValue().usage?.inputTokens} {...props} />
}
function ContextOutputUsage(props: UsageProps) {
  return <UsageRow label="Output" tokens={useContextValue().usage?.outputTokens} {...props} />
}
function ContextReasoningUsage(props: UsageProps) {
  return <UsageRow label="Reasoning" tokens={useContextValue().usage?.reasoningTokens} {...props} />
}
function ContextCacheUsage(props: UsageProps) {
  return <UsageRow label="Cache" tokens={useContextValue().usage?.cachedInputTokens} {...props} />
}

export {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
  formatTokens,
  type ContextProps,
  type ContextUsage,
}
