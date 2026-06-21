"use client";

/**
 * Client-side fetch wrapper for protected API routes.
 * APP_SECRET is verified by /api/access, which sets an httpOnly cookie.
 */

export async function apiPost(path: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
