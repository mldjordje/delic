import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function NewBookingPage() {
  await requireCompleteClientProfile();
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Book inspection</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose vehicle → service → time. 30-minute slots, no overlap.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>New booking</CardTitle>
          <CardDescription>Vehicle → service → time. 30-minute slots.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingFlow />
        </CardContent>
      </Card>
    </div>
  );
}

