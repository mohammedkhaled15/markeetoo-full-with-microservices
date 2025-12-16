import Fastify from "fastify";

const fastify = Fastify();

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
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
