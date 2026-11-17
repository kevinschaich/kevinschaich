import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // Kevin's change: without a next-themes provider (most projects only put class="dark" on <html>), follow that
  // class instead of the OS setting, so toasts match the page.
  const { theme: providerTheme } = useTheme()
  const theme =
    providerTheme ??
    (typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "system")

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

// Kevin's addition: toast() re-exported so projects never import sonner themselves. The package root already exports
// Toaster and toast from ui/toast, so the root carries these as SonnerToaster and sonnerToast; this subpath
// ('@kevinschaich/components/ui/sonner') has them under their own names.
export { Toaster, toast, Toaster as SonnerToaster, toast as sonnerToast }
