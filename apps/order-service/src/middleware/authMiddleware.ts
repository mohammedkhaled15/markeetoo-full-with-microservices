import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
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
  if (!userId) {
    return reply.code(401).send({ error: "User not authenticated" });
  }
  request.userId = userId;
};
