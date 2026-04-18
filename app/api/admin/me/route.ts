import { ok } from "@/lib/api/http";
import { requireStaffOrAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireStaffOrAdmin();
  if (auth.error) {
    return auth.error;
  }
  return ok({
    ok: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      phone: auth.user.phone,
      role: auth.user.role,
    },
  });
}
