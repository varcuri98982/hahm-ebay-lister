import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/api-guard";
import { isEbayConfigured } from "@/lib/ebay/config";
import { EBAY_COOKIE, openConnection } from "@/lib/ebay/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = guardApiRequest(req);
  if (denied) return denied;

  const configured = isEbayConfigured();
  const conn = await openConnection(req.cookies.get(EBAY_COOKIE)?.value);
  return NextResponse.json({ configured, connected: Boolean(conn) });
}
