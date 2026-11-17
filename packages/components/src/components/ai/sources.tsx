// AI Elements: Sources (https://ui.shadcn.com/docs/ai-elements/base/sources).
// The pages an answer used, after the reply: a Trace line ("Used 3 sources") that opens to one link per source.
// With the AI SDK, collect a message's `source-url` parts, deduped by url; title is optional (falls back to hostname).
import * as React from "react"
import { ArrowUpRightIcon, GlobeIcon } from "lucide-react"

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"

function sourceHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function Sources({
  defaultOpen,
  open,
  onOpenChange,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const control =
    open === undefined ? { defaultOpen } : { open, onOpenChange: onOpenChange ?? (() => {}) }
  return (
    <Trace data-slot="sources" {...props}>
      <TraceCollapsible {...control}>{children}</TraceCollapsible>
    </Trace>
  )
}

function SourcesTrigger({
  count,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & { count: number }) {
  return (
    <TraceCollapsibleTrigger {...props}>
      {children ?? (
        <TraceLine>
          <TraceIcon>
            <GlobeIcon />
          </TraceIcon>
          <TraceTitle>
            Used {count} {count === 1 ? "source" : "sources"}
          </TraceTitle>
        </TraceLine>
      )}
    </TraceCollapsibleTrigger>
  )
}

function SourcesContent({
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent {...props}>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  )
}

function Source({
  href,
  title,
  icon,
  children,
  ...props
}: React.ComponentProps<"a"> & { href: string; icon?: React.ReactNode }) {
  return (
    <a data-slot="source" href={href} target="_blank" rel="noreferrer" {...props}>
      {children ?? (
        <TraceLine>
          <TraceIcon>{icon ?? <GlobeIcon />}</TraceIcon>
          <TraceTitle>
            {title ?? sourceHostname(href)}
            <span className="sr-only"> (opens in a new tab)</span>
          </TraceTitle>
          <TraceIcon>
            <ArrowUpRightIcon />
          </TraceIcon>
        </TraceLine>
      )}
    </a>
  )
}

export { Sources, SourcesTrigger, SourcesContent, Source, sourceHostname }
