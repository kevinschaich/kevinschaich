// AI Elements: Inline Citation (https://ui.shadcn.com/docs/ai-elements/base/inline-citation).
// A source in the sentence it supports: a small secondary Button (the hostname) that opens a Hover Card with the
// source. With the AI SDK, a `source-url` part is the citation; its title is optional, so fall back to the hostname.
// For a list of sources after the reply, use Sources.
import * as React from "react"
import { cn } from "cn"

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

/** "nextjs.org" from "https://www.nextjs.org/docs"; the URL itself when it does not parse. */
function citationHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function InlineCitation({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="inline-citation"
      className={cn("group inline items-center gap-1", className)}
      {...props}
    />
  )
}

function InlineCitationText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="inline-citation-text"
      className={cn("transition-colors group-hover:bg-accent", className)}
      {...props}
    />
  )
}

function InlineCitationCard(props: React.ComponentProps<typeof HoverCard>) {
  return <HoverCard {...props} />
}

function InlineCitationCardTrigger({
  sources,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardTrigger> & {
  /** Source URLs: the trigger reads the first one's hostname, "+N" for the rest. */
  sources?: string[]
}) {
  const label =
    sources && sources.length > 0
      ? `${citationHostname(sources[0])}${sources.length > 1 ? ` +${sources.length - 1}` : ""}`
      : undefined
  return (
    <HoverCardTrigger
      delay={10}
      closeDelay={100}
      render={<Button variant="secondary" size="xs" />}
      {...props}
    >
      {children ?? label}
    </HoverCardTrigger>
  )
}

function InlineCitationCardBody({
  className,
  ...props
}: React.ComponentProps<typeof HoverCardContent>) {
  return (
    <HoverCardContent
      data-slot="inline-citation-card-body"
      className={cn("flex w-64 flex-col gap-3", className)}
      {...props}
    />
  )
}

function InlineCitationSource({
  title,
  url,
  description,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  url?: string
  description?: React.ReactNode
}) {
  return (
    <div data-slot="inline-citation-source" className={cn("flex flex-col gap-1", className)} {...props}>
      {(title ?? url) && <div className="font-medium">{title ?? citationHostname(url ?? "")}</div>}
      {description && <p className="text-muted-foreground">{description}</p>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {citationHostname(url)}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {children}
    </div>
  )
}

function InlineCitationQuote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      data-slot="inline-citation-quote"
      className={cn("border-l-2 pl-3 text-sm text-muted-foreground italic", className)}
      {...props}
    />
  )
}

// Several sources behind one citation: a Carousel in the card body, one InlineCitationSource per item.
function InlineCitationCarousel(props: React.ComponentProps<typeof Carousel>) {
  return <Carousel data-slot="inline-citation-carousel" {...props} />
}

function InlineCitationCarouselContent(props: React.ComponentProps<typeof CarouselContent>) {
  return <CarouselContent {...props} />
}

function InlineCitationCarouselItem({
  className,
  ...props
}: React.ComponentProps<typeof CarouselItem>) {
  return <CarouselItem className={cn("flex flex-col gap-3", className)} {...props} />
}

function InlineCitationCarouselHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-citation-carousel-header"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

/** "2/3": the source shown, of how many. */
function InlineCitationCarouselIndex({ className, children, ...props }: React.ComponentProps<"div">) {
  const { api } = useCarousel()
  const [index, setIndex] = React.useState({ current: 0, count: 0 })
  React.useEffect(() => {
    if (!api) {
      return
    }
    const update = () =>
      setIndex({ current: api.selectedScrollSnap() + 1, count: api.scrollSnapList().length })
    update()
    api.on("select", update)
    api.on("reInit", update)
    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])
  return (
    <div className={cn("flex-1 text-center text-xs text-muted-foreground tabular-nums", className)} {...props}>
      {children ?? `${index.current}/${index.count}`}
    </div>
  )
}

function InlineCitationCarouselPrev({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Previous source"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      {children ?? <ArrowLeftIcon />}
    </Button>
  )
}

function InlineCitationCarouselNext({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Next source"
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      {children ?? <ArrowRightIcon />}
    </Button>
  )
}

export {
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationSource,
  InlineCitationQuote,
  citationHostname,
}
