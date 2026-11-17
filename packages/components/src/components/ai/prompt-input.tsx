// AI Elements: Prompt Input (https://ui.shadcn.com/docs/ai-elements/base/prompt-input).
// The field the person types into: a form around an Input Group with a textarea, an attach button, room for the Model
// Selector menus, and a round send button. Attached files show as Attachment chips above the text. Enter sends,
// Shift+Enter adds a line. Parts are named as in AI SDK Elements. onSubmit gets the text and the files, which fit the
// AI SDK's sendMessage({ text, files }).
import * as React from "react"
import { cn } from "cn"
import {
  ArrowUpIcon,
  FileTextIcon,
  LoaderCircleIcon,
  PaperclipIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

type PromptInputFile = { id: string; file: File }

type PromptInputMessage = { text: string; files: File[] }

type PromptInputContextValue = {
  files: PromptInputFile[]
  add: (files: FileList | File[]) => void
  remove: (id: string) => void
  clear: () => void
  openFileDialog: () => void
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null)

/** The attachments and the file dialog of the surrounding PromptInput. */
function usePromptInputAttachments() {
  const context = React.useContext(PromptInputContext)
  if (!context) {
    throw new Error("Prompt Input parts must be used within PromptInput")
  }
  return context
}

type PromptInputProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) => void
  /** For the file input, e.g. "image/*". */
  accept?: string
  multiple?: boolean
  inputGroupClassName?: string
}

function PromptInput({
  onSubmit,
  accept,
  multiple = true,
  className,
  inputGroupClassName,
  children,
  ...props
}: PromptInputProps) {
  const [files, setFiles] = React.useState<PromptInputFile[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const value = React.useMemo<PromptInputContextValue>(
    () => ({
      files,
      add: (added) =>
        setFiles((current) => [
          ...current,
          ...Array.from(added, (file) => ({ id: crypto.randomUUID(), file })),
        ]),
      remove: (id) => setFiles((current) => current.filter((item) => item.id !== id)),
      clear: () => setFiles([]),
      openFileDialog: () => inputRef.current?.click(),
    }),
    [files]
  )

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const text = String(new FormData(form).get("message") ?? "").trim()
    if (!text && files.length === 0) {
      return
    }
    onSubmit({ text, files: files.map((item) => item.file) }, event)
    form.reset()
    setFiles([])
  }

  return (
    <PromptInputContext.Provider value={value}>
      <form data-slot="prompt-input" className={cn("w-full", className)} onSubmit={submit} {...props}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            if (event.target.files) {
              value.add(event.target.files)
            }
            event.target.value = ""
          }}
        />
        <InputGroup className={inputGroupClassName}>{children}</InputGroup>
      </form>
    </PromptInputContext.Provider>
  )
}

/** Named "message" so PromptInput reads it on submit. Enter sends, Shift+Enter adds a line. */
function PromptInputTextarea({
  className,
  onKeyDown,
  placeholder = "What would you like to know?",
  ...props
}: React.ComponentProps<typeof InputGroupTextarea>) {
  return (
    <InputGroupTextarea
      name="message"
      placeholder={placeholder}
      className={cn("p-3", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) {
          return
        }
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          event.currentTarget.form?.requestSubmit()
        }
      }}
      {...props}
    />
  )
}

/** Above the text: the attachment chips (shown when there are files), or your own children. */
function PromptInputHeader({
  className,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupAddon>) {
  const { files } = usePromptInputAttachments()
  if (!children && files.length === 0) {
    return null
  }
  return (
    <InputGroupAddon align="block-start" className={cn("flex-wrap", className)} {...props}>
      {children ?? <PromptInputAttachments />}
    </InputGroupAddon>
  )
}

function PromptInputAttachments() {
  const { files, remove } = usePromptInputAttachments()
  return (
    <>
      {files.map(({ id, file }) => (
        <Attachment key={id} size="sm">
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${file.name}`} onClick={() => remove(id)}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </>
  )
}

/** Under the text: attach, the model menus, and send. */
function PromptInputFooter(props: React.ComponentProps<typeof InputGroupAddon>) {
  return <InputGroupAddon align="block-end" {...props} />
}

function PromptInputTools({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="prompt-input-tools" className={cn("flex min-w-0 items-center gap-1", className)} {...props} />
}

function PromptInputButton({
  variant = "outline",
  size = "sm",
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  return <InputGroupButton variant={variant} size={size} {...props} />
}

/** The round + button that opens the file dialog. */
function PromptInputAttachButton({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const { openFileDialog } = usePromptInputAttachments()
  return (
    <InputGroupButton
      size="icon-sm"
      variant="outline"
      aria-label="Attach files"
      className={cn("rounded-full", className)}
      onClick={(event) => {
        onClick?.(event)
        openFileDialog()
      }}
      {...props}
    >
      {children ?? <PlusIcon />}
    </InputGroupButton>
  )
}

function PromptInputActionMenu(props: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu {...props} />
}

/** The round + button, opening a menu of actions. */
function PromptInputActionMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  return (
    <DropdownMenuTrigger
      render={
        <InputGroupButton
          size="icon-sm"
          variant="outline"
          aria-label="More actions"
          className={cn("rounded-full", className)}
          {...props}
        />
      }
    >
      {children ?? <PlusIcon />}
    </DropdownMenuTrigger>
  )
}

function PromptInputActionMenuContent(props: React.ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent align="start" {...props} />
}

function PromptInputActionMenuItem(props: React.ComponentProps<typeof DropdownMenuItem>) {
  return <DropdownMenuItem {...props} />
}

/** A menu item that opens the file dialog. */
function PromptInputActionAddAttachments({
  label = "Add photos or files",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & { label?: React.ReactNode }) {
  const { openFileDialog } = usePromptInputAttachments()
  return (
    <DropdownMenuItem onClick={() => openFileDialog()} {...props}>
      <PaperclipIcon />
      {label}
    </DropdownMenuItem>
  )
}

type PromptInputStatus = "ready" | "submitted" | "streaming" | "error"

/** The round send button: an arrow while ready, a spinner once sent, a stop square while the reply streams. */
function PromptInputSubmit({
  status = "ready",
  className,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupButton> & { status?: PromptInputStatus }) {
  const icon =
    status === "submitted" ? (
      <LoaderCircleIcon className="animate-spin" />
    ) : status === "streaming" ? (
      <SquareIcon className="fill-current" />
    ) : status === "error" ? (
      <XIcon />
    ) : (
      <ArrowUpIcon />
    )
  return (
    <InputGroupButton
      type="submit"
      size="icon-sm"
      variant="default"
      aria-label={status === "streaming" ? "Stop" : "Send"}
      className={cn("ml-auto rounded-full", className)}
      {...props}
    >
      {children ?? icon}
    </InputGroupButton>
  )
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputAttachments,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputAttachButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
  usePromptInputAttachments,
  type PromptInputProps,
  type PromptInputMessage,
  type PromptInputFile,
  type PromptInputStatus,
}
