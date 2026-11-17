// AI Elements: Checkpoint (https://ui.shadcn.com/docs/ai-elements/base/checkpoint).
// A point in the conversation you can return to: a separator Marker after a turn, with a Restore button. Restore
// keeps that turn and drops every message after it (with the AI SDK: setMessages(messages.slice(0, index + 1))).
import * as React from "react"
import { cn } from "cn"
import { BookmarkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Checkpoint({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Marker>, "variant">) {
  return (
    <Marker data-slot="checkpoint" variant="separator" {...props}>
      <MarkerContent className={cn("inline-flex items-center gap-2", className)}>
        {children}
      </MarkerContent>
    </Marker>
  )
}

function CheckpointIcon({
  children,
  ...props
}: React.ComponentProps<typeof MarkerIcon>) {
  return <MarkerIcon {...props}>{children ?? <BookmarkIcon />}</MarkerIcon>
}

function CheckpointTrigger({
  tooltip,
  children = "Restore",
  ...props
}: React.ComponentProps<typeof Button> & { tooltip?: React.ReactNode }) {
  const button = (
    <Button size="xs" variant="outline" {...props}>
      {children}
    </Button>
  )
  if (!tooltip) {
    return button
  }
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export { Checkpoint, CheckpointIcon, CheckpointTrigger }
