"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddVehicleDialog } from "@/components/portal/AddVehicleDialog";

export function VehiclesClientExtras() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <AddVehicleDialog
        onCreated={() => {
          router.refresh();
        }}
      />
      <Button asChild variant="outline">
        <Link href="/bookings/new">Zakaži</Link>
      </Button>
    </div>
  );
}

