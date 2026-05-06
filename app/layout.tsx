import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { ToastProviderState } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { getPublicAppUrl } from "@/lib/env";

const SITE_URL = getPublicAppUrl();

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["AutomotiveBusiness", "LocalBusiness"],
  "@id": `${SITE_URL}/#business`,
  name: "Auto Delić",
  alternateName: "Auto Delić — tehnički pregled Niš",
  description:
    "Auto Delić je vodeća stanica za tehnički pregled vozila u Nišu. Pružamo usluge tehničkog pregleda, registracije vozila, osiguranja i prenosa vlasništva na jednom mestu. Online zakazivanje tehničkog pregleda je dostupno 24/7.",
  url: SITE_URL,
  telephone: "+381652200739",
  email: "adtehnickipregled@gmail.com",
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
    latitude: 43.3184,
    longitude: 21.8954,
  },
  hasMap: "https://maps.google.com/?q=Branka+Cosica+3+Nis+Serbia",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "14:00",
    },
  ],
  image: `${SITE_URL}/assets/images/logonovi.png`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/images/logonovi.png`,
    width: 512,
    height: 512,
  },
  priceRange: "$$",
  currenciesAccepted: "RSD",
  paymentAccepted: "Cash, Credit Card",
  areaServed: [
    { "@type": "City", name: "Niš" },
    { "@type": "City", name: "Niška Banja" },
    { "@type": "City", name: "Aleksinac" },
  ],
  serviceType: [
    "Tehnički pregled vozila",
    "Registracija vozila",
    "Osiguranje vozila",
    "Prenos vlasništva vozila",
    "Prodaja polovnih vozila",
  ],
  sameAs: [],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Auto Delić — tehnički pregled vozila Niš",
    template: "%s | Auto Delić Niš",
  },
  description:
    "Auto Delić — stanica za tehnički pregled vozila u Nišu, Branka Ćosića 3. Online zakazivanje tehničkog pregleda, registracija vozila, osiguranje i prenos vlasništva. Pozovite +381 65 220 0739.",
  keywords: [
    "tehnički pregled Niš",
    "tehnički pregled vozila Niš",
    "zakazivanje tehničkog pregleda",
    "online zakazivanje tehnički pregled",
    "Auto Delić Niš",
    "registracija vozila Niš",
    "osiguranje vozila Niš",
    "prenos vlasništva vozila Niš",
    "tehnički pregled Branka Ćosića",
    "stanica tehničkog pregleda Niš",
    "polovni automobili Niš",
  ],
  openGraph: {
    siteName: "Auto Delić",
    type: "website",
    locale: "sr_RS",
    url: "/",
    title: "Auto Delić — tehnički pregled vozila Niš",
    description:
      "Stanica za tehnički pregled vozila u Nišu. Online zakazivanje, registracija, osiguranje i prenos vlasništva na jednom mestu.",
    images: [
      {
        url: "/assets/images/tehnicki2.jpg",
        width: 1200,
        height: 630,
        alt: "Auto Delić — stanica za tehnički pregled vozila Niš",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Delić — tehnički pregled vozila Niš",
    description:
      "Stanica za tehnički pregled vozila u Nišu. Online zakazivanje, registracija, osiguranje i prenos vlasništva.",
    images: ["/assets/images/tehnicki2.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.png" }],
  },
  verification: {},
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
