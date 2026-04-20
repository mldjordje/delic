"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MeProfileResponse = {
  ok: boolean;
  profile: { fullName: string | null } | null;
  user: { email: string; phone: string | null; role: string };
};

export function ProfilePanel({ forceComplete }: { forceComplete: boolean }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<MeProfileResponse | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const isComplete = useMemo(() => {
    const nameOk = fullName.trim().length >= 2;
    const phoneOk = phone.trim().length >= 6;
    return nameOk && phoneOk;
  }, [fullName, phone]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const r = await fetch("/api/me/profile", { credentials: "include" });
      const j = (await r.json().catch(() => null)) as MeProfileResponse | null;
      if (!r.ok || !j) {
        window.location.href = "/prijava?next=%2Fprofile";
        return;
      }
      setData(j);
      setFullName(j.profile?.fullName || "");
      setPhone(j.user?.phone || "");
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/me/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
    });
    const j = (await r.json().catch(() => null)) as MeProfileResponse | null;
    setSaving(false);
    if (!r.ok || !j) {
      setMsg({ tone: "warn", text: (j as any)?.message || "Greška pri čuvanju profila." });
      return;
    }
    setData(j);
    setMsg({ tone: "ok", text: "Profil je sačuvan." });
    if (forceComplete) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          {forceComplete
            ? "Complete your profile to continue (name + phone)."
            : "Update your name and phone number."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Email: <span className="text-foreground">{data?.user?.email}</span>
              </div>
              <Button type="button" onClick={() => void save()} disabled={saving || (forceComplete && !isComplete)}>
                {saving ? "Saving…" : forceComplete ? "Save & continue" : "Save"}
              </Button>
            </div>

            {msg ? (
              <div
                className={cn(
                  "glass rounded-lg p-4 text-sm",
                  msg.tone === "ok" ? "border border-emerald-500/30" : "border border-amber-500/30"
                )}
              >
                {msg.text}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

