import { PublicBookingWidget } from "@/components/booking/PublicBookingWidget";
import { EmbedHeightReporter } from "@/components/booking/EmbedHeightReporter";

export const metadata = {
  title: "Zakazivanje (embed)",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ZakazivanjeEmbedPage() {
  return (
    <main className="min-h-0 bg-transparent p-0">
      <EmbedHeightReporter>
        <PublicBookingWidget className="booking-embed-widget" />
      </EmbedHeightReporter>
    </main>
  );
}

