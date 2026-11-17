// AI Elements: Confirmation (https://ui.shadcn.com/docs/ai-elements/base/confirmation).
// A prompt to approve or deny a tool before it runs. A pending approval is a question for the person, not a step the
// agent took, so it sits outside Trace as an outlined Item. Once answered, render the call as a Tool line again.
// With the AI SDK: answer with addToolApprovalResponse({ id: approval.id, approved }) and pass
// sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses to useChat.
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { ToolPart, ToolState } from "@/components/ai/tool"

type ConfirmationContextValue = {
  approval?: ToolPart["approval"]
  state: ToolState
}

const ConfirmationContext =
  React.createContext<ConfirmationContextValue | null>(null)

function useConfirmation() {
  const context = React.useContext(ConfirmationContext)
  if (!context) {
    throw new Error("Confirmation parts must be used within Confirmation")
  }
  return context
}

type ConfirmationProps = Omit<React.ComponentProps<typeof Item>, "variant" | "size"> & {
  approval?: ToolPart["approval"]
  state: ToolState
}

/** Renders nothing until the tool asks for approval (it has an `approval` and is past its input states). */
function Confirmation({ approval, state, children, ...props }: ConfirmationProps) {
  if (!approval || state === "input-streaming" || state === "input-available") {
    return null
  }
  return (
    <ConfirmationContext.Provider value={{ approval, state }}>
      <Item data-slot="confirmation" variant="outline" size="sm" {...props}>
        {children}
      </Item>
    </ConfirmationContext.Provider>
  )
}

/** The icon beside the question, like a TerminalIcon for a command. */
function ConfirmationMedia(props: React.ComponentProps<typeof ItemMedia>) {
  return <ItemMedia variant="icon" {...props} />
}

function ConfirmationTitle({
  description,
  children,
  ...props
}: React.ComponentProps<typeof ItemContent> & { description?: React.ReactNode }) {
  return (
    <ItemContent {...props}>
      <ItemTitle>{children}</ItemTitle>
      {description && <ItemDescription>{description}</ItemDescription>}
    </ItemContent>
  )
}

/** Shown while the approval is waiting for an answer. */
function ConfirmationRequest({ children }: { children?: React.ReactNode }) {
  const { state } = useConfirmation()
  return state === "approval-requested" ? <>{children}</> : null
}

const answered: ToolState[] = ["approval-responded", "output-denied", "output-available"]

/** Shown once the person approved. */
function ConfirmationAccepted({ children }: { children?: React.ReactNode }) {
  const { approval, state } = useConfirmation()
  return approval?.approved === true && answered.includes(state) ? <>{children}</> : null
}

/** Shown once the person denied. */
function ConfirmationRejected({ children }: { children?: React.ReactNode }) {
  const { approval, state } = useConfirmation()
  return approval?.approved === false && answered.includes(state) ? <>{children}</> : null
}

/** The Approve and Deny buttons; only shown while the approval waits. */
function ConfirmationActions(props: React.ComponentProps<typeof ItemActions>) {
  const { state } = useConfirmation()
  return state === "approval-requested" ? <ItemActions {...props} /> : null
}

function ConfirmationAction(props: React.ComponentProps<typeof Button>) {
  return <Button size="sm" {...props} />
}

export {
  Confirmation,
  ConfirmationMedia,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
  type ConfirmationProps,
}
