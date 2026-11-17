// AI Elements: Model Selector (https://ui.shadcn.com/docs/ai-elements/base/model-selector).
// A Dropdown Menu that picks the model (and, as a second menu, the effort), meant for the Prompt Input's bottom row:
// the trigger is an InputGroupButton (render={<InputGroupButton size="sm" variant="outline" />}), models are radio
// items grouped by provider, and picking one closes the menu. Parts are named as in AI SDK Elements. There is no search
// field: a menu is enough for a handful of models.
import * as React from "react"
import { cn } from "cn"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function ModelSelector(props: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu {...props} />
}

function ModelSelectorTrigger(props: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return <DropdownMenuTrigger data-slot="model-selector-trigger" {...props} />
}

function ModelSelectorContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent align="start" className={cn("w-48", className)} {...props} />
}

/** The radio group of models; `value` is the selected model's id. */
function ModelSelectorList(props: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="model-selector-list" {...props} />
}

function ModelSelectorGroup({
  heading,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup> & { heading?: React.ReactNode }) {
  return (
    <DropdownMenuGroup {...props}>
      {heading && <DropdownMenuLabel>{heading}</DropdownMenuLabel>}
      {children}
    </DropdownMenuGroup>
  )
}

function ModelSelectorItem(props: React.ComponentProps<typeof DropdownMenuRadioItem>) {
  return <DropdownMenuRadioItem closeOnClick {...props} />
}

function ModelSelectorSeparator(props: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return <DropdownMenuSeparator {...props} />
}

function ModelSelectorShortcut(props: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return <DropdownMenuShortcut {...props} />
}

/** A provider's logo from models.dev (e.g. provider="anthropic"), drawn in the text colour. */
function ModelSelectorLogo({
  provider,
  className,
  ...props
}: Omit<React.ComponentProps<"img">, "src" | "alt"> & { provider: string }) {
  return (
    <img
      data-slot="model-selector-logo"
      alt={`${provider} logo`}
      src={`https://models.dev/logos/${provider}.svg`}
      width={12}
      height={12}
      className={cn("size-3 dark:invert", className)}
      {...props}
    />
  )
}

function ModelSelectorLogoGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="model-selector-logo-group"
      className={cn(
        "flex shrink-0 items-center -space-x-1 [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 [&>img]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function ModelSelectorName({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="model-selector-name" className={cn("flex-1 truncate text-left", className)} {...props} />
}

export {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorList,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
}
