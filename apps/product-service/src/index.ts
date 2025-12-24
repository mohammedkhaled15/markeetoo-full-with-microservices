import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  })
);

app.use(express.json());

app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/test", shouldBeUser, (req, res) => {
  res.json({ message: "You are logged in", userId: req.userId });
});

app.use("/products", productRouter);

app.use("/categories", categoryRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);

app.listen(8000, () => {
  console.log("Product Service Server is Running on port 8000");
});
