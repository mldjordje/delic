export type LoginRole = "client" | "staff" | "admin";

export function loginDestinationForRole(role: LoginRole | null | undefined) {
  if (role === "admin" || role === "staff") return "/admin/kalendar";
  if (role === "client") return "/dashboard";
  return null;
}
