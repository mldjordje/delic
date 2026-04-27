import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { ToastProviderState } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { getPublicAppUrl } from "@/lib/env";

const BASE_URL = getPublicAppUrl();

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "AutoRepair"],
  name: "Auto Delić",
  url: BASE_URL,
  telephone: ["+381652200739", "+381624430050"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Branka Ćosića 3",
    addressLocality: "Niš",
    addressRegion: "Nišavski okrug",
    postalCode: "18000",
    addressCountry: "RS",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.3148,
    longitude: 21.8954,
  },
  hasMap: "https://maps.google.com/?q=Auto+Delić+Niš",
  priceRange: "$$",
  currenciesAccepted: "RSD",
  paymentAccepted: "Cash, Credit Card",
  areaServed: { "@type": "City", name: "Niš" },
  description:
    "Auto Delić nudi tehnički pregled vozila, registraciju vozila, probne tablice, zelene kartone i prodaju polovnih automobila u Nišu.",
  knowsAbout: [
    "Tehnički pregled vozila",
    "Registracija vozila",
    "Probne tablice",
    "Zeleni kartoni",
    "Prenos vlasništva vozila",
    "Prodaja polovnih automobila",
  ],
  sameAs: [],
  image: `${BASE_URL}/assets/images/logonovi.png`,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Auto Delić — tehnički pregled vozila, Niš",
    template: "%s | Auto Delić",
  },
  description:
    "Tehnički pregled vozila, registracija, probne tablice, zeleni kartoni i prodaja polovnih automobila — Niš. Online zakazivanje termina.",
  keywords: [
    "tehnički pregled",
    "tehnički pregled vozila",
    "tehnički pregled Niš",
    "registracija vozila Niš",
    "probne tablice",
    "zeleni kartoni",
    "prenos vozila",
    "polovni automobili Niš",
    "Auto Delić",
    "zakazivanje tehničkog pregleda",
  ],
  openGraph: {
    siteName: "Auto Delić",
    type: "website",
    locale: "sr_RS",
    url: "/",
    images: [
      {
        url: "/assets/images/logonovi.png",
        width: 512,
        height: 512,
        alt: "Auto Delić — tehnički pregled vozila, Niš",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Auto Delić — tehnički pregled vozila, Niš",
    description:
      "Tehnički pregled vozila, registracija, probne tablice, zeleni kartoni i prodaja polovnih automobila u Nišu.",
    images: ["/assets/images/logonovi.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.png" }],
  },
};

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  variable: "--font-open-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`dark ${openSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className={`${openSans.className} antialiased`}>
        <ToastProviderState>
          {children}
          <Toaster />
          <PwaRegistrar />
        </ToastProviderState>
      </body>
    </html>
  );
}
