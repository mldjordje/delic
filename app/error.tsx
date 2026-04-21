"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error", error);
  }, [error]);

  return (
    <main className="page-container page-section">
      <Card className="glass p-6">
        <h1 className="h2">Nešto je pošlo po zlu</h1>
        <p className="lead mt-2">
          Pokušajte ponovo. Ako se problem ponavlja, pošaljite nam vreme i korak na kojem se desilo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => reset()}>
            Pokušaj ponovo
          </Button>
          <Button type="button" variant="outline" onClick={() => (window.location.href = "/")}>
            Početna
          </Button>
        </div>
      </Card>
    </main>
  );
}

