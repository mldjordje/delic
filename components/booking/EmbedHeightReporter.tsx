"use client";

import { useEffect, useRef } from "react";

export function EmbedHeightReporter({
  channel = "autodelic-booking-height",
  children,
}: {
  channel?: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    function post() {
      const h = Math.ceil(el.getBoundingClientRect().height);
      window.parent?.postMessage({ type: channel, height: h }, "*");
    }

    post();
    const ro = new ResizeObserver(() => post());
    ro.observe(el);
    window.addEventListener("load", post);
    window.addEventListener("resize", post);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", post);
      window.removeEventListener("resize", post);
    };
  }, [channel]);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}

