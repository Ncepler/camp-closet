import { NextRequest } from "next/server";

/**
 * Checks that the incoming request carries the admin password
 * in the `x-admin-key` header. Used by all /api/admin/* routes.
 */
export function isAdminAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return !!key && key === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}
