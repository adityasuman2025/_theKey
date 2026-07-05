import type { Request, Response, NextFunction } from "express";

export type AuthenticatedRequest = Request & {
  userId: string;
  userRole: "student" | "moderator";
};

/**
 * Middleware that extracts x-user-id and x-user-role from request headers.
 * Does NOT block — downstream routes check access via core/auth.ts.
 * This just attaches the values to the request object.
 */
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];

  if (typeof userId === "string" && userId.length > 0) {
    (req as AuthenticatedRequest).userId = userId;
  }

  if (
    typeof userRole === "string" &&
    (userRole === "student" || userRole === "moderator")
  ) {
    (req as AuthenticatedRequest).userRole = userRole as "student" | "moderator";
  }

  next();
}

/**
 * Helper to extract the authenticated user from a request.
 * Returns null if headers are missing — callers return 401.
 */
export function getUser(req: Request): { userId: string; userRole: "student" | "moderator" } | null {
  const r = req as AuthenticatedRequest;
  if (r.userId && r.userRole) return { userId: r.userId, userRole: r.userRole };
  return null;
}
