import { ClientKlijentDetalji } from "./ClientKlijentDetalji";

export const metadata = {
  title: "Klijent",
};

export default async function AdminKlijentDetaljiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientKlijentDetalji id={id} />;
}

