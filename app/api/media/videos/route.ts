import { desc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { withCors, corsPreflightResponse } from "@/lib/api/cors";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request) || new Response(null, { status: 405 });
}

export async function GET(request: Request) {
  const pre = corsPreflightResponse(request);
  if (pre) {
    return pre;
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.videoLinks)
    .where(eq(schema.videoLinks.isPublished, true))
    .orderBy(desc(schema.videoLinks.createdAt));

  return withCors(request, ok({ ok: true, videos: rows }));
}
