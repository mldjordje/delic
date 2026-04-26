import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function NewBookingPage() {
  await requireCompleteClientProfile();
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Zakazivanje tehničkog pregleda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Izaberite vozilo → uslugu → slobodan termin.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Novi termin</CardTitle>
          <CardDescription>Vozilo → usluga → termin.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingFlow />
        </CardContent>
      </Card>
    </div>
  );
}
