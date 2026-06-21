import { NextRequest, NextResponse } from "next/server";
import {
  hasValidAccessCookie,
  isAccessConfigured,
  rateLimitRequest,
  setAccessCookie,
  verifyAccessCode,
} from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = rateLimitRequest(req);
  if (limited) return limited;

  const configured = isAccessConfigured();
  return NextResponse.json({
    configured,
    verified: !configured || hasValidAccessCookie(req),
  });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitRequest(req);
  if (limited) return limited;

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!verifyAccessCode(body.code?.trim() || "")) {
    return NextResponse.json(
      { ok: false, code: "ACCESS_CODE_REQUIRED", error: "Access code required." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  setAccessCookie(res);
  return res;
}
