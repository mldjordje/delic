const STATUS_COLOR: Record<string, string> = {
  pending: "#64748b",
  confirmed: "#2563eb",
  completed: "#16a34a",
  cancelled: "#d97706",
  no_show: "#7c3aed",
  blocked: "#92400e",
};

export function bookingCalendarColor(
  status: string,
  inspectionResult: "passed" | "failed" | null
): string {
  if (status === "completed" && inspectionResult === "failed") return "#dc2626";
  if (status === "completed" && inspectionResult === "passed") return "#16a34a";
  return STATUS_COLOR[status] || "#64748b";
}
