"use client";

import { useEffect, useMemo, useState } from "react";

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPwaButton({
  className,
  label = "Instaliraj aplikaciju",
}: {
  className?: string;
  label?: string;
}) {
  const [deferred, setDeferred] = useState<DeferredPrompt | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod/.test(ua);
  }, []);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as DeferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
  }, []);

  const canInstall = Boolean(deferred);

  if (!canInstall && !isIos) {
    return null;
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        className={className}
        onClick={async () => {
          if (deferred) {
            await deferred.prompt();
            try {
              await deferred.userChoice;
            } catch {}
            setDeferred(null);
            return;
          }
          // iOS Safari: no beforeinstallprompt.
          setShowIosHelp((v) => !v);
        }}
      >
        {label}
      </button>

      {showIosHelp ? (
        <div style={{ fontSize: 13, color: "rgba(148, 163, 184, 0.95)", maxWidth: 320 }}>
          Na iPhone-u: klikni <strong>Share</strong> pa <strong>Add to Home Screen</strong>.
        </div>
      ) : null}
    </div>
  );
}

