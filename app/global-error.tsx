"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global app error", error);
  }, [error]);

  return (
    <html lang="sr" className="dark">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "hsl(222 47% 5%)", color: "hsl(210 40% 98%)" }}>
          <div style={{ width: "100%", maxWidth: 720, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 24, background: "rgba(255,255,255,0.04)" }}>
            <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 20 }}>Greška u aplikaciji</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>
              Ova greška je neočekivana. Pokušajte ponovo ili osvežite stranicu.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <Button type="button" onClick={() => reset()}>
                Pokušaj ponovo
              </Button>
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Osveži
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

