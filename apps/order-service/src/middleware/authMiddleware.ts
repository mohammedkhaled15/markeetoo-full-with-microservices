import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import type { CustomJwtSessionClaims } from "@repo/types";
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

export const shouldBeUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = getAuth(request);
  const userId = auth.userId;
  console.log("authFromMiddlware: ", auth);
  if (!userId) {
    return reply.code(401).send({ error: "User not authenticated" });
  }
  request.userId = userId;
};

export const shouldBeAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = getAuth(request);
  const userId = auth.userId;
  console.log("authFromMiddlware: ", auth);
  if (!userId) {
    return reply.code(401).send({ error: "User not authenticated" });
  }
  const claims = auth.sessionClaims as CustomJwtSessionClaims;
  if (claims.metadata?.role !== "admin") {
    return reply.code(401).send({ error: "Admin Only Can Access This Entry!" });
  }
  request.userId = userId;
};
