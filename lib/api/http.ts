import { NextResponse } from "next/server";

export function ok(data: Record<string, unknown> = {}, init: ResponseInit = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created(data: Record<string, unknown> = {}) {
  return NextResponse.json(data, { status: 201 });
}

export function fail(status: number, message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
