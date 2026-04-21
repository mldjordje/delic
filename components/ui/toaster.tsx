"use client";

import { ToastProvider, ToastViewport, Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

function toneClass(tone: string | undefined) {
  if (tone === "success") return "border-emerald-500/30";
  if (tone === "warn") return "border-amber-500/30";
  return "border-border/80";
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((t) => (
        <Toast key={t.id} className={cn(toneClass(t.tone))} onOpenChange={(open) => !open && dismiss(t.id)}>
          <div className="grid gap-1">
            {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
            {t.description ? <ToastDescription>{t.description}</ToastDescription> : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

