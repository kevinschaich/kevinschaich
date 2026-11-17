// AI Elements: File Tree (https://ui.shadcn.com/docs/ai-elements/base/file-tree).
// The files the agent changed, as folders you can open: a folder is a Collapsible, a file a ghost Button. For a single
// file the agent read or edited, use a Tool line instead. Parts are named as in AI SDK Elements.
import * as React from "react"
import { cn } from "cn"
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type FileTreeContextValue = {
  expanded?: Set<string>
  setFolderOpen: (path: string, open: boolean) => void
  selectedPath?: string
  onSelect?: (path: string) => void
}

const FileTreeContext = React.createContext<FileTreeContextValue>({
  setFolderOpen: () => {},
})

type FileTreeProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** Open folders by path, controlled. Without this or defaultExpanded, each folder starts open. */
  expanded?: Set<string>
  defaultExpanded?: Set<string>
  onExpandedChange?: (expanded: Set<string>) => void
  selectedPath?: string
  onSelect?: (path: string) => void
}

function FileTree({
  expanded,
  defaultExpanded,
  onExpandedChange,
  selectedPath,
  onSelect,
  className,
  ...props
}: FileTreeProps) {
  const [inner, setInner] = React.useState(defaultExpanded)
  const current = expanded ?? inner
  const setFolderOpen = React.useCallback(
    (path: string, open: boolean) => {
      const next = new Set(current ?? [])
      if (open) {
        next.add(path)
      } else {
        next.delete(path)
      }
      setInner(next)
      onExpandedChange?.(next)
    },
    [current, onExpandedChange]
  )
  return (
    <FileTreeContext.Provider
      value={{ expanded: current, setFolderOpen, selectedPath, onSelect }}
    >
      <div
        data-slot="file-tree"
        role="tree"
        className={cn("flex w-full flex-col text-sm", className)}
        {...props}
      />
    </FileTreeContext.Provider>
  )
}

type FileTreeFolderProps = Omit<React.ComponentProps<typeof Collapsible>, "open"> & {
  path: string
  name: React.ReactNode
  /** Used when the tree does not track open folders. Default true. */
  defaultOpen?: boolean
}

function FileTreeFolder({
  path,
  name,
  defaultOpen = true,
  children,
  className,
  ...props
}: FileTreeFolderProps) {
  const { expanded, setFolderOpen } = React.useContext(FileTreeContext)
  const control = expanded
    ? {
        open: expanded.has(path),
        onOpenChange: (open: boolean) => setFolderOpen(path, open),
      }
    : { defaultOpen }
  return (
    <Collapsible data-slot="file-tree-folder" role="treeitem" className={className} {...control} {...props}>
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="group/file-tree-folder w-full justify-start font-normal aria-expanded:bg-transparent aria-expanded:hover:bg-muted dark:aria-expanded:hover:bg-muted/50"
          />
        }
      >
        <ChevronRightIcon className="transition-transform group-aria-expanded/file-tree-folder:rotate-90" />
        <FolderIcon className="group-aria-expanded/file-tree-folder:hidden" />
        <FolderOpenIcon className="hidden group-aria-expanded/file-tree-folder:block" />
        <FileTreeName>{name}</FileTreeName>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div role="group" className="ml-4 flex flex-col">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

type FileTreeFileProps = Omit<React.ComponentProps<typeof Button>, "onSelect"> & {
  path: string
  name?: React.ReactNode
  icon?: React.ReactNode
  /** FileTreeActions shown beside the file (never inside its button). */
  actions?: React.ReactNode
}

function FileTreeFile({
  path,
  name,
  icon,
  actions,
  children,
  className,
  onClick,
  ...props
}: FileTreeFileProps) {
  const { selectedPath, onSelect } = React.useContext(FileTreeContext)
  const selected = selectedPath === path
  const button = (
    <Button
      data-slot="file-tree-file"
      role="treeitem"
      variant="ghost"
      size="sm"
      aria-current={selected ? "true" : undefined}
      aria-selected={selected}
      className={cn(
        "min-w-0 flex-1 justify-start font-normal",
        selected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        onSelect?.(path)
      }}
      {...props}
    >
      {children ?? (
        <>
          <FileTreeIcon>{icon ?? <FileIcon />}</FileTreeIcon>
          <FileTreeName>{name ?? path.split("/").at(-1)}</FileTreeName>
        </>
      )}
    </Button>
  )
  return actions ? (
    <div className="flex w-full items-center gap-1">
      {button}
      {actions}
    </div>
  ) : (
    <div className="flex w-full">{button}</div>
  )
}

function FileTreeIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="file-tree-icon"
      aria-hidden="true"
      className={cn("flex shrink-0 items-center [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

function FileTreeName({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="file-tree-name" className={cn("truncate", className)} {...props} />
}

function FileTreeActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-tree-actions"
      className={cn("flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
}

export {
  FileTree,
  FileTreeFolder,
  FileTreeFile,
  FileTreeIcon,
  FileTreeName,
  FileTreeActions,
  type FileTreeProps,
  type FileTreeFolderProps,
  type FileTreeFileProps,
}
