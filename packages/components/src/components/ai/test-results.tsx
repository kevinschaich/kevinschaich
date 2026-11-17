// AI Elements: Test Results (https://ui.shadcn.com/docs/ai-elements/base/test-results).
// A test run as a Trace line ("Ran 42 tests, 2 failed"), opening to suites grouped by file, then tests. Failed suites
// and tests start open, with the failure in a Code Block. Run the tests as a tool; its states map as in Tool.
// Parts are named as in AI SDK Elements.
import * as React from "react"
import { cn } from "cn"
import {
  CheckIcon,
  CircleDashedIcon,
  FileCodeIcon,
  FlaskConicalIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react"

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"
import { Progress } from "@/components/ui/progress"
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

type TestStatusValue = "passed" | "failed" | "skipped" | "running"

type TestResultsSummaryData = {
  passed: number
  failed: number
  skipped: number
  total: number
  /** Milliseconds. */
  duration?: number
}

const TestResultsContext = React.createContext<{ summary?: TestResultsSummaryData }>({})

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2).replace(/\.?0+$/, "")}s`
}

/** "42 tests, 2 failed, 1 skipped". */
function formatTestCounts({ total, failed, skipped }: Pick<TestResultsSummaryData, "total" | "failed" | "skipped">) {
  return [`${total} ${total === 1 ? "test" : "tests"}`, failed > 0 && `${failed} failed`, skipped > 0 && `${skipped} skipped`]
    .filter(Boolean)
    .join(", ")
}

function TestResults({
  summary,
  defaultOpen,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  summary?: TestResultsSummaryData
  /** Defaults to open when a test failed. */
  defaultOpen?: boolean
}) {
  return (
    <TestResultsContext.Provider value={{ summary }}>
      <Trace data-slot="test-results" {...props}>
        <TraceCollapsible defaultOpen={defaultOpen ?? (summary?.failed ?? 0) > 0}>{children}</TraceCollapsible>
      </Trace>
    </TestResultsContext.Provider>
  )
}

function TestResultsHeader({
  icon,
  isRunning,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & { icon?: React.ReactNode; isRunning?: boolean }) {
  const { summary } = React.useContext(TestResultsContext)
  return (
    <TraceCollapsibleTrigger {...props}>
      <TraceLine status={isRunning ? "running" : (summary?.failed ?? 0) > 0 ? "error" : undefined}>
        <TraceIcon>{icon ?? <FlaskConicalIcon />}</TraceIcon>
        {children ?? (
          <>
            <TestResultsSummary />
            <TestResultsDuration />
          </>
        )}
      </TraceLine>
    </TraceCollapsibleTrigger>
  )
}

function TestResultsSummary({ children, ...props }: React.ComponentProps<typeof TraceTitle>) {
  const { summary } = React.useContext(TestResultsContext)
  return <TraceTitle {...props}>{children ?? (summary ? `Ran ${formatTestCounts(summary)}` : "Tests")}</TraceTitle>
}

function TestResultsDuration({ children, ...props }: React.ComponentProps<typeof TraceDescription>) {
  const { summary } = React.useContext(TestResultsContext)
  if (!children && summary?.duration === undefined) {
    return null
  }
  return <TraceDescription {...props}>{children ?? formatDuration(summary!.duration!)}</TraceDescription>
}

function TestResultsProgress({ className, ...props }: Omit<React.ComponentProps<typeof Progress>, "value">) {
  const { summary } = React.useContext(TestResultsContext)
  const value = summary && summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0
  return <Progress value={value} aria-label="Tests passed" className={cn("w-full", className)} {...props} />
}

function TestResultsContent({ children, ...props }: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent keepMounted {...props}>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  )
}

const TestSuiteContext = React.createContext<{ name: string; status?: TestStatusValue }>({ name: "" })

/** One file's tests. Starts open when it has a failure. */
function TestSuite({
  name,
  status,
  defaultOpen,
  ...props
}: React.ComponentProps<typeof TraceCollapsible> & { name: string; status?: TestStatusValue }) {
  return (
    <TestSuiteContext.Provider value={{ name, status }}>
      <TraceCollapsible data-slot="test-suite" defaultOpen={defaultOpen ?? status === "failed"} {...props} />
    </TestSuiteContext.Provider>
  )
}

function TestSuiteName({
  icon,
  children,
  ...props
}: React.ComponentProps<typeof TraceCollapsibleTrigger> & { icon?: React.ReactNode }) {
  const { name, status } = React.useContext(TestSuiteContext)
  return (
    <TraceCollapsibleTrigger {...props}>
      <TraceLine status={status === "failed" ? "error" : status === "running" ? "running" : undefined}>
        <TraceIcon>{icon ?? <FileCodeIcon />}</TraceIcon>
        {children ?? <TraceTitle>{name}</TraceTitle>}
      </TraceLine>
    </TraceCollapsibleTrigger>
  )
}

/** The suite's counts, after its name. */
function TestSuiteStats({
  passed = 0,
  failed = 0,
  skipped = 0,
  children,
  ...props
}: React.ComponentProps<typeof TraceDescription> & { passed?: number; failed?: number; skipped?: number }) {
  return (
    <TraceDescription {...props}>
      {children ?? formatTestCounts({ total: passed + failed + skipped, failed, skipped })}
    </TraceDescription>
  )
}

function TestSuiteContent({ children, ...props }: React.ComponentProps<typeof TraceCollapsibleContent>) {
  return (
    <TraceCollapsibleContent keepMounted {...props}>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  )
}

const TestContext = React.createContext<{ name: string; status: TestStatusValue; duration?: number }>({
  name: "",
  status: "passed",
})

/** One test. A failed test with children (a TestError) opens to show them. */
function Test({
  name,
  status,
  duration,
  defaultOpen = true,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TraceLine>, "children" | "status"> & {
  name: string
  status: TestStatusValue
  /** Milliseconds. */
  duration?: number
  defaultOpen?: boolean
  children?: React.ReactNode
}) {
  const line = (
    <TraceLine
      data-slot="test"
      status={status === "failed" ? "error" : status === "running" ? "running" : undefined}
      {...props}
    >
      <TestStatus />
      <TestName />
      <TestDuration />
    </TraceLine>
  )
  return (
    <TestContext.Provider value={{ name, status, duration }}>
      {children ? (
        <TraceCollapsible defaultOpen={status === "failed" && defaultOpen}>
          <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>{children}</TraceCollapsibleContent>
        </TraceCollapsible>
      ) : (
        line
      )}
    </TestContext.Provider>
  )
}

function TestStatus({ children, ...props }: React.ComponentProps<typeof TraceIcon>) {
  const { status } = React.useContext(TestContext)
  return (
    <TraceIcon {...props}>
      {children ??
        (status === "failed" ? (
          <XIcon />
        ) : status === "skipped" ? (
          <CircleDashedIcon />
        ) : status === "running" ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <CheckIcon />
        ))}
    </TraceIcon>
  )
}

function TestName({ children, ...props }: React.ComponentProps<typeof TraceTitle>) {
  const { name, status } = React.useContext(TestContext)
  return <TraceTitle {...props}>{children ?? (status === "skipped" ? `Skipped ${name}` : name)}</TraceTitle>
}

function TestDuration({ children, ...props }: React.ComponentProps<typeof TraceDescription>) {
  const { duration } = React.useContext(TestContext)
  if (!children && duration === undefined) {
    return null
  }
  return <TraceDescription {...props}>{children ?? formatDuration(duration!)}</TraceDescription>
}

/** The failure: TestErrorMessage, then TestErrorStack. */
function TestError({ children, ...props }: Omit<React.ComponentProps<typeof CodeBlock>, "size">) {
  return (
    <CodeBlock data-slot="test-error" size="sm" {...props}>
      <CodeBlockContent wrap className="max-h-64">
        {children}
      </CodeBlockContent>
    </CodeBlock>
  )
}

function TestErrorMessage({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="test-error-message" className={cn("block text-destructive", className)} {...props} />
}

function TestErrorStack({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="test-error-stack" className={cn("mt-2 block text-muted-foreground", className)} {...props} />
}

export {
  TestResults,
  TestResultsHeader,
  TestResultsSummary,
  TestResultsDuration,
  TestResultsProgress,
  TestResultsContent,
  TestSuite,
  TestSuiteName,
  TestSuiteStats,
  TestSuiteContent,
  Test,
  TestStatus,
  TestName,
  TestDuration,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  formatTestCounts,
  type TestStatusValue,
  type TestResultsSummaryData,
}
