"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";

// Horizontal scroller (.rail) with previous/next controls for pointer users.
// Touch users swipe; the arrows only show from lg up.
export function ProductRail({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * ref.current.clientWidth * 0.75, behavior: "smooth" });

  const arrow =
    "btn-icon absolute top-[40%] z-20 hidden -translate-y-1/2 bg-background shadow-float disabled:pointer-events-none disabled:opacity-0 lg:inline-flex";

  return (
    <div className="relative">
      <ul ref={ref} className="rail" aria-label={label}>
        {children}
      </ul>
      <button
        type="button"
        aria-label="Previous"
        className={`${arrow} left-2`}
        disabled={edges.start}
        onClick={() => scroll(-1)}
      >
        <ArrowRightIcon className="rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Next"
        className={`${arrow} right-2`}
        disabled={edges.end}
        onClick={() => scroll(1)}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
}
