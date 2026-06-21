export function initialBookingStatus(autoConfirmBookings: boolean): "pending" | "confirmed" {
  return autoConfirmBookings ? "confirmed" : "pending";
}
