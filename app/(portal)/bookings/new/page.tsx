import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { PublicBookingWidget } from "@/components/booking/PublicBookingWidget";

export default async function NewBookingPage() {
  await requireCompleteClientProfile();
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Zakazivanje tehničkog pregleda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vozilo → datum → slobodan termin. Brzo i jednostavno.
        </p>
      </div>

      <PublicBookingWidget />
    </div>
  );
}
