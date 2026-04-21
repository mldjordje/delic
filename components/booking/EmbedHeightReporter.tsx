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
    function post() {
      const el = rootRef.current;
      if (!el) return;
      const h = Math.ceil(el.getBoundingClientRect().height);
      window.parent?.postMessage({ type: channel, height: h }, "*");
    }

    const el = rootRef.current;
    if (!el) return;

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

