import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", clerkMiddleware());
app.use("*", cors({ origin: "http://localhost:3002" }));

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/sessions", sessionRoute);

const start = async () => {
  try {
    serve({ fetch: app.fetch, port: 8002 }, (info) =>
      console.log("Payment service is Running on Port 8002 ")
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
