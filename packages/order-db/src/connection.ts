import mongoose from "mongoose";

let isConnected = false;

export const connectOrderDb = async () => {
  if (isConnected) return;
  if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL is not defined");
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("Connected Successfully to MongoDb!");
    isConnected = true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
