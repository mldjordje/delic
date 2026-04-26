"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BookingsClientActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [busy, setBusy] = useState(false);
  const canCancel = status === "pending" || status === "confirmed";

  async function cancel() {
    if (!canCancel) return;
    setBusy(true);
    const r = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setBusy(false);
    if (r.ok) {
      window.location.reload();
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canCancel || busy}
        onClick={() => void cancel()}
      >
        {busy ? "Otkazujem…" : "Otkaži"}
      </Button>
    </div>
  );
}

