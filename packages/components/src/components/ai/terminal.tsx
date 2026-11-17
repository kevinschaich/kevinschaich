// AI Elements: Terminal (https://ui.shadcn.com/docs/ai-elements/base/terminal).
// A command the agent ran: a Trace line ("Running pnpm build", "Ran pnpm build", "pnpm lint exited with code 1")
// that opens to its output in a Code Block. It opens by itself once output arrives while the command runs. To stream
// output with the AI SDK, write it from the tool as a data part with the tool call's id; it updates in place.
// ANSI colour codes are stripped (no ansi-to-react here). Parts are named as in AI SDK Elements.
import * as React from "react"
import { cn } from "cn"
import { CheckIcon, CopyIcon, TerminalIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

type TerminalContextValue = {
  output: string
  isStreaming: boolean
  failed: boolean
  autoScroll: boolean
  onClear?: () => void
}

const TerminalContext = React.createContext<TerminalContextValue | null>(null)

function useTerminal() {
  const context = React.useContext(TerminalContext)
  if (!context) {
    throw new Error("Terminal parts must be used within Terminal")
  }
  return context
}

// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g

type TerminalProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & {
    output: string
    isStreaming?: boolean
    /** A nonzero code marks the command failed. */
    exitCode?: number
    /** Also marks it failed, e.g. when the tool part is output-error. */
    failed?: boolean
    /** Keep the output scrolled to its end as it grows. Default true. */
    autoScroll?: boolean
    onClear?: () => void
  }

function Terminal({
  output,
  isStreaming = false,
  exitCode,
  failed,
  autoScroll = true,
  onClear,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: TerminalProps) {
  const clean = React.useMemo(() => output.replace(ANSI, ""), [output])
  const state = useTraceOpen(
    { open, defaultOpen, onOpenChange },
    isStreaming && clean.length > 0
  )
  const value = {
    output: clean,
    isStreaming,
    failed: !isStreaming && (failed === true || (exitCode !== undefined && exitCode !== 0)),
    autoScroll,
    onClear,
  }
  return (
    <TerminalContext.Provider value={value}>
      <Trace data-slot="terminal" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </TerminalContext.Provider>
  )
}

/** The command's line: put a TerminalTitle in it. `actions` sit beside it, not inside its button. */
function TerminalHeader({
  actions,
  children,
  className,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & { actions?: React.ReactNode }) {
  const { isStreaming, failed } = useTerminal()
  const trigger = (
    <TraceCollapsibleTrigger className={actions ? undefined : className} {...props}>
      <TraceLine status={isStreaming ? "running" : failed ? "error" : undefined}>{children}</TraceLine>
    </TraceCollapsibleTrigger>
  )
  if (!actions) {
    return trigger
  }
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {trigger}
      {actions}
    </div>
  )
}

/** "Ran pnpm build": the title is yours, so it can say the tense and the exit code. */
function TerminalTitle({
  icon,
  children,
  ...props
}: React.ComponentProps<typeof TraceTitle> & { icon?: React.ReactNode }) {
  return (
    <>
      <TraceIcon>{icon ?? <TerminalIcon />}</TraceIcon>
      <TraceTitle {...props}>{children}</TraceTitle>
    </>
  )
}

function TerminalContent({
  className,
  ...props
}: Omit<React.ComponentProps<typeof TraceCollapsibleContent>, "children">) {
  const { output, autoScroll } = useTerminal()
  const ref = React.useRef<HTMLPreElement>(null)
  React.useEffect(() => {
    if (autoScroll && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [output, autoScroll])
  return (
    <TraceCollapsibleContent className={className} {...props}>
      <CodeBlock size="sm">
        <CodeBlockContent ref={ref} wrap className="max-h-64">
          {output}
        </CodeBlockContent>
      </CodeBlock>
    </TraceCollapsibleContent>
  )
}

/** A short status beside the line, like the exit code or "Running". */
function TerminalStatus({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="terminal-status" className={cn("shrink-0 text-xs text-muted-foreground tabular-nums", className)} {...props} />
}

function TerminalActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="terminal-actions" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />
}

function TerminalCopyButton({
  timeout = 2000,
  onCopy,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { timeout?: number; onCopy?: () => void }) {
  const { output } = useTerminal()
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) {
      return
    }
    const id = setTimeout(() => setCopied(false), timeout)
    return () => clearTimeout(id)
  }, [copied, timeout])
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Copied" : "Copy output"}
      onClick={() => {
        void navigator.clipboard?.writeText(output).then(() => {
          setCopied(true)
          onCopy?.()
        })
      }}
      {...props}
    >
      {children ?? (copied ? <CheckIcon /> : <CopyIcon />)}
    </Button>
  )
}

function TerminalClearButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { onClear } = useTerminal()
  if (!onClear) {
    return null
  }
  return (
    <Button variant="ghost" size="icon-xs" aria-label="Clear output" onClick={onClear} {...props}>
      {children ?? <Trash2Icon />}
    </Button>
  )
}

export {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalContent,
  TerminalStatus,
  TerminalActions,
  TerminalCopyButton,
  TerminalClearButton,
  useTerminal,
  type TerminalProps,
}
