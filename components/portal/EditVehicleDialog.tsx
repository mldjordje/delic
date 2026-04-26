"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type VehicleEdit = {
  id: string;
  make: string;
  model: string | null;
  plateNumber: string | null;
  vin: string | null;
  fuelType: string | null;
  year: number;
  registrationExpiresOn: string;
  hasLpgOrMethane: boolean;
  lpgMethaneCertificateExpiresOn: string | null;
};

export function EditVehicleDialog({
  vehicle,
  onSaved,
}: {
  vehicle: VehicleEdit;
  onSaved: (vehicle: VehicleEdit) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model || "");
  const [plateNumber, setPlateNumber] = useState(vehicle.plateNumber || "");
  const [fuelType, setFuelType] = useState(vehicle.fuelType || "");
  const [vin, setVin] = useState(vehicle.vin || "");
  const [year, setYear] = useState<number>(vehicle.year);
  const [registrationExpiresOn, setRegistrationExpiresOn] = useState(vehicle.registrationExpiresOn);
  const [hasLpgOrMethane, setHasLpgOrMethane] = useState(vehicle.hasLpgOrMethane);
  const [lpgExpiresOn, setLpgExpiresOn] = useState(vehicle.lpgMethaneCertificateExpiresOn || "");

  const canSave = useMemo(() => {
    if (!make.trim()) return false;
    if (!plateNumber.trim()) return false;
    if (!fuelType) return false;
    if (!registrationExpiresOn) return false;
    if (hasLpgOrMethane && !lpgExpiresOn) return false;
    return true;
  }, [make, plateNumber, fuelType, registrationExpiresOn, hasLpgOrMethane, lpgExpiresOn]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch(`/api/me/vehicles/${vehicle.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: make.trim(),
        model: model.trim() || null,
        plateNumber: plateNumber.trim().toUpperCase(),
        fuelType,
        vin: vin.trim() || null,
        year,
        registrationExpiresOn,
        hasLpgOrMethane,
        lpgMethaneCertificateExpiresOn: hasLpgOrMethane ? lpgExpiresOn : null,
      }),
    });
    const j = await r.json().catch(() => null);
    setSaving(false);
    if (!r.ok) {
      setMsg({ tone: "warn", text: j?.message || "Greška pri izmeni vozila." });
      return;
    }
    setMsg({ tone: "ok", text: "Sačuvano." });
    onSaved(j.vehicle as VehicleEdit);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setMsg(null); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Izmeni
        </Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Izmena vozila</DialogTitle>
          <DialogDescription>Ažurirajte podatke sa saobraćajne dozvole.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="makeE">Marka</Label>
            <Input id="makeE" value={make} onChange={(e) => setMake(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plateE">Tablice</Label>
            <Input id="plateE" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelE">Model (opciono)</Label>
            <Input id="modelE" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelE">Gorivo</Label>
            <select
              id="fuelE"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background/40 px-3 text-sm"
            >
              <option value="">— izaberite —</option>
              <option value="petrol">Benzin</option>
              <option value="diesel">Dizel</option>
              <option value="hybrid">Hibrid</option>
              <option value="ev">Električno</option>
              <option value="lpg">LPG</option>
              <option value="cng">CNG</option>
              <option value="other">Drugo</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearE">Godište</Label>
            <Input id="yearE" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regE">Istek registracije</Label>
            <Input id="regE" type="date" value={registrationExpiresOn} onChange={(e) => setRegistrationExpiresOn(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vinE">VIN (opciono)</Label>
            <Input id="vinE" value={vin} onChange={(e) => setVin(e.target.value)} />
          </div>

          <div className="md:col-span-2 flex items-center gap-2 rounded-md border bg-background/30 p-3">
            <input
              id="hasLpgE"
              type="checkbox"
              checked={hasLpgOrMethane}
              onChange={(e) => setHasLpgOrMethane(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <Label htmlFor="hasLpgE" className="cursor-pointer">
              LPG/CNG (atest)
            </Label>
          </div>

          {hasLpgOrMethane ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lpgE">Istek atesta</Label>
              <Input id="lpgE" type="date" value={lpgExpiresOn} onChange={(e) => setLpgExpiresOn(e.target.value)} />
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
            Otkaži
          </Button>
          <Button type="button" onClick={() => void save()} disabled={!canSave || saving}>
            {saving ? "Čuvam…" : "Sačuvaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

