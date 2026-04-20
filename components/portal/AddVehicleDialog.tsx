"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Vehicle = {
  id: string;
  make: string;
  year: number;
  registrationExpiresOn: string;
  hasLpgOrMethane: boolean;
  lpgMethaneCertificateExpiresOn: string | null;
};

export function AddVehicleDialog({
  onCreated,
}: {
  onCreated: (vehicle: Vehicle) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const [make, setMake] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [registrationExpiresOn, setRegistrationExpiresOn] = useState("");
  const [hasLpgOrMethane, setHasLpgOrMethane] = useState(false);
  const [lpgMethaneCertificateExpiresOn, setLpgMethaneCertificateExpiresOn] = useState<string>("");

  const canSave = useMemo(() => {
    if (!make.trim()) return false;
    if (!registrationExpiresOn) return false;
    if (hasLpgOrMethane && !lpgMethaneCertificateExpiresOn) return false;
    return true;
  }, [make, registrationExpiresOn, hasLpgOrMethane, lpgMethaneCertificateExpiresOn]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/me/vehicles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: make.trim(),
        year,
        registrationExpiresOn,
        hasLpgOrMethane,
        lpgMethaneCertificateExpiresOn: hasLpgOrMethane ? lpgMethaneCertificateExpiresOn : null,
      }),
    });
    const j = await r.json().catch(() => null);
    setSaving(false);
    if (!r.ok) {
      setMsg({ tone: "warn", text: j?.message || "Greška pri dodavanju vozila." });
      return;
    }
    setMsg({ tone: "ok", text: "Vozilo je dodato." });
    onCreated(j.vehicle as Vehicle);
    setOpen(false);
    setMake("");
    setRegistrationExpiresOn("");
    setHasLpgOrMethane(false);
    setLpgMethaneCertificateExpiresOn("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setMsg(null); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          Add vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Add vehicle</DialogTitle>
          <DialogDescription>Basic details + important expiry dates.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="make">Brand / make</Label>
            <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Volkswagen Golf" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg">Registration expiry</Label>
            <Input id="reg" type="date" value={registrationExpiresOn} onChange={(e) => setRegistrationExpiresOn(e.target.value)} />
          </div>

          <div className="md:col-span-2 flex items-center gap-2 rounded-md border bg-background/30 p-3">
            <input
              id="hasLpg"
              type="checkbox"
              checked={hasLpgOrMethane}
              onChange={(e) => setHasLpgOrMethane(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <Label htmlFor="hasLpg" className="cursor-pointer">
              Has gas / attest
            </Label>
          </div>

          {hasLpgOrMethane ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lpg">Gas certificate expiry</Label>
              <Input
                id="lpg"
                type="date"
                value={lpgMethaneCertificateExpiresOn}
                onChange={(e) => setLpgMethaneCertificateExpiresOn(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        {msg ? (
          <div className={cn("mt-4 rounded-lg border p-3 text-sm", msg.tone === "ok" ? "border-emerald-500/30" : "border-amber-500/30")}>
            {msg.text}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void save()} disabled={!canSave || saving}>
            {saving ? "Saving…" : "Save vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

