// AI Elements: Stack Trace (https://ui.shadcn.com/docs/ai-elements/base/stack-trace).
// A failed tool's error as a Trace line ("Failed: TypeError: …") that opens to the full error and its frames in a
// muted monospace block, with framework frames (node_modules, node:) dimmed so your own stand out. With the AI SDK an
// output-error part's errorText is only the message; return error.stack from onError (in development) to get frames.
// Parts are named as in AI SDK Elements.
import * as React from "react"
import { cn } from "cn"
import { CheckIcon, CircleXIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

type StackFrame = {
  raw: string
  functionName?: string
  filePath?: string
  lineNumber?: number
  columnNumber?: number
  isInternal: boolean
}

type ParsedStackTrace = {
  errorType?: string
  errorMessage: string
  frames: StackFrame[]
  raw: string
}

function parseStackFrame(line: string): StackFrame {
  const raw = line.trim()
  const match =
    raw.match(/^at (.+?) \((.+):(\d+):(\d+)\)$/) ?? raw.match(/^at ()(.+):(\d+):(\d+)$/)
  return {
    raw,
    functionName: match?.[1] || undefined,
    filePath: match?.[2],
    lineNumber: match ? Number(match[3]) : undefined,
    columnNumber: match ? Number(match[4]) : undefined,
    isInternal: raw.includes("node_modules") || raw.includes("node:"),
  }
}

function parseStackTrace(trace: string): ParsedStackTrace {
  const lines = trace.split("\n").map((line) => line.trim()).filter(Boolean)
  const [first = "", ...rest] = lines
  const error = first.match(/^([A-Za-z_$][\w$]*(?:Error|Exception)|Error):\s*(.*)$/)
  return {
    errorType: error?.[1],
    errorMessage: error ? error[2] : first,
    frames: rest.filter((line) => line.startsWith("at ")).map(parseStackFrame),
    raw: trace,
  }
}

type StackTraceContextValue = ParsedStackTrace & {
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void
}

const StackTraceContext = React.createContext<StackTraceContextValue | null>(null)

function useStackTrace() {
  const context = React.useContext(StackTraceContext)
  if (!context) {
    throw new Error("Stack Trace parts must be used within StackTrace")
  }
  return context
}

type StackTraceProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void } & {
    trace: string
    /** Makes your own frames' file paths buttons. */
    onFilePathClick?: (filePath: string, line?: number, column?: number) => void
  }

function StackTrace({
  trace,
  onFilePathClick,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: StackTraceProps) {
  const parsed = React.useMemo(() => parseStackTrace(trace), [trace])
  const state = useTraceOpen({ open, defaultOpen, onOpenChange })
  return (
    <StackTraceContext.Provider value={{ ...parsed, onFilePathClick }}>
      <Trace data-slot="stack-trace" {...props}>
        <TraceCollapsible open={state.open} onOpenChange={state.onOpenChange}>
          {children}
        </TraceCollapsible>
      </Trace>
    </StackTraceContext.Provider>
  )
}

/** The error line. `actions` (StackTraceActions) sit beside it, not inside its button. */
function StackTraceHeader({
  icon,
  actions,
  children,
  className,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & {
  icon?: React.ReactNode
  actions?: React.ReactNode
}) {
  const trigger = (
    <TraceCollapsibleTrigger className={actions ? undefined : className} {...props}>
      <TraceLine status="error">
        <TraceIcon>{icon ?? <CircleXIcon />}</TraceIcon>
        {children ?? <StackTraceError />}
      </TraceLine>
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

function StackTraceError({ children, ...props }: React.ComponentProps<typeof TraceTitle>) {
  return (
    <TraceTitle {...props}>
      {children ?? (
        <>
          Failed: <StackTraceErrorType />
          <StackTraceErrorMessage />
        </>
      )}
    </TraceTitle>
  )
}

function StackTraceErrorType({ children, ...props }: React.ComponentProps<"span">) {
  const { errorType } = useStackTrace()
  if (!children && !errorType) {
    return null
  }
  return <span data-slot="stack-trace-error-type" {...props}>{children ?? `${errorType}: `}</span>
}

function StackTraceErrorMessage({ children, ...props }: React.ComponentProps<"span">) {
  const { errorMessage } = useStackTrace()
  return <span data-slot="stack-trace-error-message" {...props}>{children ?? errorMessage}</span>
}

function StackTraceContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent className={cn("flex flex-col gap-2", className)} {...props}>
      {children ?? <StackTraceFrames />}
    </TraceCollapsibleContent>
  )
}

/** The full error, then every frame. The title truncates, so the error is repeated at the top. */
function StackTraceFrames({
  showInternalFrames = true,
  className,
  ...props
}: React.ComponentProps<"div"> & { showInternalFrames?: boolean }) {
  const { errorType, errorMessage, frames, onFilePathClick } = useStackTrace()
  const shown = showInternalFrames ? frames : frames.filter((frame) => !frame.isInternal)
  return (
    <div
      data-slot="stack-trace-frames"
      className={cn("flex flex-col gap-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs", className)}
      {...props}
    >
      <p className="text-destructive">
        {errorType ? `${errorType}: ` : ""}
        {errorMessage}
      </p>
      {shown.length > 0 && (
        <ol className="flex flex-col gap-1">
          {shown.map((frame, index) => (
            <li
              key={index}
              className={cn("whitespace-nowrap", !frame.isInternal && "text-foreground")}
            >
              {onFilePathClick && frame.filePath && !frame.isInternal ? (
                <>
                  at {frame.functionName && `${frame.functionName} `}(
                  <button
                    type="button"
                    className="cursor-pointer underline-offset-2 hover:underline"
                    onClick={() =>
                      onFilePathClick(frame.filePath!, frame.lineNumber, frame.columnNumber)
                    }
                  >
                    {frame.filePath}:{frame.lineNumber}:{frame.columnNumber}
                  </button>
                  )
                </>
              ) : (
                frame.raw
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** The whole line opens the frames, so there is no separate expand button. */
function StackTraceExpandButton(_props: { className?: string }) {
  return null
}

function StackTraceActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stack-trace-actions" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />
}

function StackTraceCopyButton({
  onCopy,
  timeout = 2000,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { onCopy?: () => void; timeout?: number }) {
  const { raw } = useStackTrace()
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
      aria-label={copied ? "Copied" : "Copy stack trace"}
      onClick={() => {
        void navigator.clipboard?.writeText(raw).then(() => {
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

export {
  StackTrace,
  StackTraceHeader,
  StackTraceError,
  StackTraceErrorType,
  StackTraceErrorMessage,
  StackTraceContent,
  StackTraceFrames,
  StackTraceExpandButton,
  StackTraceActions,
  StackTraceCopyButton,
  parseStackTrace,
  useStackTrace,
  type StackTraceProps,
  type StackFrame,
  type ParsedStackTrace,
}
