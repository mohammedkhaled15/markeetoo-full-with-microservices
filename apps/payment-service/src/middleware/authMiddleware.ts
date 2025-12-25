import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import type { CustomJwtSessionClaims } from "@repo/types";

export const shouldBeUser = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({
      message: "You aren't loged in!",
    });
  }

  c.set("userId", auth.userId);

  await next();
});

export const shouldBeAdmin = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({
      message: "You aren't loged in!",
    });
  }
  const claims = auth.sessionClaims as CustomJwtSessionClaims;
  if (claims.metadata?.role !== "admin") {
    return c.json({
      message: "Admin Only Can Access This Entry!",
    });
  }

  c.set("userId", auth.userId);

  await next();
});
