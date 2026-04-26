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
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [color, setColor] = useState("");
  const [vin, setVin] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [engineCc, setEngineCc] = useState<number | "">("");
  const [powerKw, setPowerKw] = useState<number | "">("");
  const [registrationExpiresOn, setRegistrationExpiresOn] = useState("");
  const [hasLpgOrMethane, setHasLpgOrMethane] = useState(false);
  const [lpgMethaneCertificateExpiresOn, setLpgMethaneCertificateExpiresOn] = useState<string>("");

  const canSave = useMemo(() => {
    if (!make.trim()) return false;
    if (!plateNumber.trim()) return false;
    if (!fuelType) return false;
    if (!color.trim()) return false;
    if (engineCc === "" || engineCc <= 0) return false;
    if (powerKw === "" || powerKw <= 0) return false;
    if (!registrationExpiresOn) return false;
    if (hasLpgOrMethane && !lpgMethaneCertificateExpiresOn) return false;
    return true;
  }, [make, plateNumber, fuelType, color, engineCc, powerKw, registrationExpiresOn, hasLpgOrMethane, lpgMethaneCertificateExpiresOn]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/me/vehicles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: make.trim(),
        plateNumber: plateNumber.trim().toUpperCase(),
        model: model.trim() || null,
        fuelType: fuelType,
        color: color.trim(),
        vin: vin.trim() || null,
        engineCc: engineCc === "" ? null : engineCc,
        powerKw: powerKw === "" ? null : String(powerKw),
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
    setEngineCc("");
    setPowerKw("");
    setPlateNumber("");
    setModel("");
    setFuelType("");
    setColor("");
    setVin("");
    setHasLpgOrMethane(false);
    setLpgMethaneCertificateExpiresOn("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setMsg(null); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          Dodaj vozilo
        </Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Dodaj vozilo</DialogTitle>
          <DialogDescription>Unesite osnovne podatke (za tehnički/registraciju) i datume isteka.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="make">Marka / model</Label>
            <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="npr. Volkswagen Golf" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate">Tablice</Label>
            <Input id="plate" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="NI-123-AB" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model (opciono)</Label>
            <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Golf / Passat…" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel">Gorivo</Label>
            <select
              id="fuel"
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
            <Label htmlFor="color">Boja</Label>
            <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="npr. crna" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Godište</Label>
            <Input id="year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg">Istek registracije</Label>
            <Input id="reg" type="date" value={registrationExpiresOn} onChange={(e) => setRegistrationExpiresOn(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineCc">Zapremina (cm³)</Label>
            <Input
              id="engineCc"
              type="number"
              min={50}
              value={engineCc}
              onChange={(e) => setEngineCc(e.target.value ? Number(e.target.value) : "")}
              placeholder="npr. 1968"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="powerKw">Snaga (kW)</Label>
            <Input
              id="powerKw"
              type="number"
              min={1}
              value={powerKw}
              onChange={(e) => setPowerKw(e.target.value ? Number(e.target.value) : "")}
              placeholder="npr. 110"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vin">VIN (opciono)</Label>
            <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="npr. WVWZZZ…" />
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
              LPG/CNG (atest)
            </Label>
          </div>

          {hasLpgOrMethane ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lpg">Istek atesta</Label>
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
            Otkaži
          </Button>
          <Button type="button" onClick={() => void save()} disabled={!canSave || saving}>
            {saving ? "Čuvam…" : "Sačuvaj vozilo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
