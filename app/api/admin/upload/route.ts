import { put } from "@vercel/blob";
import { fail, ok } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_FOLDERS = new Set(["polovni", "blog"]);

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return fail(503, "Blob skladište nije konfigurisano (BLOB_READ_WRITE_TOKEN).");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Očekuje se multipart/form-data.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail(400, "Očekuje se polje file (slika).");
  }

  const folderRaw = form.get("folder");
  const folder = typeof folderRaw === "string" && ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "polovni";

  if (file.size === 0) {
    return fail(400, "Prazan fajl.");
  }
  if (file.size > MAX_BYTES) {
    return fail(400, "Fajl je prevelik (maks. 8 MB).");
  }

  const type = file.type;
  if (!ALLOWED_TYPES.has(type)) {
    return fail(400, "Dozvoljene su samo slike JPEG, PNG ili WebP.");
  }

  const ext = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
  const pathname = `${folder}/${crypto.randomUUID()}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return ok({ ok: true, url: blob.url });
  } catch (e) {
    console.error("[admin/upload]", e);
    return fail(500, "Otpremanje nije uspelo.");
  }
}
