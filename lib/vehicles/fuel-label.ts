const FUEL_LABELS: Record<string, string> = {
  petrol: "Benzin",
  diesel: "Dizel",
  electric: "Električni pogon",
  hybrid: "Hibrid",
  lpg: "TNG",
  methane: "Metan",
};

export function fuelLabelSr(value: string | null | undefined): string | null {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  return FUEL_LABELS[normalized.toLowerCase()] || normalized;
}
