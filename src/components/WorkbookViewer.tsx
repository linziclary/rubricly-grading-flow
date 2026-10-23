import { useEffect, useRef, useState } from 'react'
import { assignment } from '../data/mock'
import { Tag } from './Tag'

// Workbook pages are drawn at 640×790 in Figma; overlays below use those coordinates.
const PAGE_W = 640
const PAGE_H = 790
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

type WorkbookViewerProps = {
  onViewReasoning: () => void
}

export function WorkbookViewer({ onViewReasoning }: WorkbookViewerProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.indexOf(1))
  const [activePage, setActivePage] = useState(0)
  const zoom = ZOOM_STEPS[zoomIndex]

  // Track which page is mostly in view so the tab follows scrolling.
  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActivePage(Number((visible.target as HTMLElement).dataset.page))
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    )
    pageRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [zoom])

  const goTo = (index: number) => {
    setActivePage(index)
    pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={scroller} className="relative h-full min-w-0 flex-1 overflow-auto" aria-label="Student workbook">
      <div className="sticky top-0 z-10 flex justify-center bg-page/95 px-4 pb-3 pt-6 backdrop-blur-sm">
        <div className="flex h-8 w-[640px] max-w-full items-center justify-between">
          <div role="tablist" aria-label="Workbook pages" className="flex items-center gap-2">
            {assignment.pages.map((_, i) => (
              <span key={i} role="tab" aria-selected={activePage === i}>
                <Tag tone="neutral" variant={activePage === i ? 'filled' : 'plain'} onClick={() => goTo(i)}>
                  {`Page ${i + 1}`}
                </Tag>
              </span>
            ))}
          </div>
          <div className="flex items-center text-sm font-semibold leading-[1.4] text-n3">
            <button
              type="button"
              aria-label="Zoom out"
              disabled={zoomIndex === 0}
              onClick={() => setZoomIndex((z) => Math.max(0, z - 1))}
              className="rounded px-1.5 hover:bg-black/5 disabled:opacity-40"
            >
              −
            </button>
            <span aria-live="polite" className="w-12 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              onClick={() => setZoomIndex((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
              className="rounded px-1.5 hover:bg-black/5 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* w-max + min-w-full: centred when it fits, fully scrollable (no clipped left edge) when zoomed wider. */}
      <div className="flex w-max min-w-full flex-col items-center gap-6 px-4 pb-6 pt-3">
        {assignment.pages.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              pageRefs.current[i] = el
            }}
            data-page={i}
            className="relative shrink-0 scroll-mt-16 overflow-hidden rounded bg-white shadow-page"
            style={{ width: PAGE_W * zoom, height: PAGE_H * zoom }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${zoom})` }}
            >
              <img
                src={src}
                alt={`Workbook page ${i + 1} of ${assignment.pages.length}`}
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
              {i === 0 && <EvidenceHighlight onViewReasoning={onViewReasoning} />}
              {assignment.pageComments
                .filter((c) => c.page === i + 1)
                .map((c) => (
                  <div
                    key={c.text}
                    className="absolute flex flex-col gap-1 rounded-md border border-border bg-white px-3 py-2.5 leading-[1.4] shadow-comment"
                    style={{ left: c.x, top: c.y }}
                  >
                    <p className="text-2xs font-semibold text-n4">{c.author} · comment</p>
                    <p className="w-[220px] text-xs leading-[1.4] text-ink">{c.text}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Dashed AI evidence box and its orange label on page 1 (positions from Figma). */
function EvidenceHighlight({ onViewReasoning }: { onViewReasoning: () => void }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute rounded border-[1.5px] border-dashed border-primary bg-primary/8"
        style={{ left: 35.39, top: 167.23, width: 59.39, height: 415.82 }}
      />
      <div
        className="absolute flex items-center gap-[9px] whitespace-nowrap rounded-xl bg-primary px-2 py-1 text-2xs font-semibold text-white"
        style={{ left: 8, top: 145.86 }}
      >
        <span>✦ {assignment.ai.evidenceLabel}</span>
        <button type="button" onClick={onViewReasoning} className="underline-offset-2 hover:underline">
          View all reasoning
        </button>
      </div>
    </>
  )
}
