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
    <main className="bg-transparent p-4 md:p-6">
      <div className="mx-auto w-full max-w-3xl">
        <EmbedHeightReporter>
          <PublicBookingWidget />
        </EmbedHeightReporter>
      </div>
    </main>
  );
}

