import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "", {
      dbName: process.env.MONGO_DB_NAME,
    });

    console.log("[INFO] Connected to database");
  } catch (error) {
    console.log("[ERROR] Failed to connect to database", error);
  }
};

export const disconnect = async () => {
  try {
    await mongoose.disconnect();

    console.log("[INFO] Disconnected from database");
  } catch (error) {
    console.log("[ERROR] Failed to disconnect from database", error);
  }
};

export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const getDatabase = () => {
  return mongoose.connection.db;
};
