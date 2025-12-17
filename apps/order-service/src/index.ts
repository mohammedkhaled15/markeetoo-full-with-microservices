import Fastify from "fastify";
import { clerkPlugin, getAuth } from "@clerk/fastify";
import { shouldBeUser } from "./middleware/authMiddleware.js";

const fastify = Fastify();

fastify.register(clerkPlugin);

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (req, reply) => {
  return reply.send({
    message: "User retrieved successfully",
    userId: req.userId,
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 8001 });
    console.log("Order service server is running on Port 8001");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
