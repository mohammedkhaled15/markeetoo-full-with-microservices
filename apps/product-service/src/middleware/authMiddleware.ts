import { getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import type { CustomJwtSessionClaims } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      userId?: string | null;
    }
  }
}

export const shouldBeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  req.userId = auth.userId;
  return next();
};

export const shouldBeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const claims = auth.sessionClaims as CustomJwtSessionClaims;
  if (claims.metadata?.role !== "admin") {
    return res
      .status(401)
      .json({ message: "Admin Only Can Access This Entry!" });
  }
  req.userId = auth.userId;
  return next();
};
