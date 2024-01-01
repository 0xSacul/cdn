import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT;
const serverStartTime = Date.now();

// ENABLE CORS & JWT PROTECTION
const ENABLE = false;

/* =========================== DATABASE ========================== */
import { connect, isConnected } from "./database/client";
connect();

/* =========================== CORS & JWT ========================== */
const corsWhitelist = [
  "http://localhost:3000",
  "https://lifeinvader.visionrp.fr",
  "https://life-invader.up.railway.app",
];
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!ENABLE) {
      return callback(null, true);
    } else {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(`[ERROR/CORS] Not allowed by CORS: ${origin}`);
      }
    }
  },
  maxAllowedContentLength: 100000000, // 100MB
};
app.use(cors(corsOptions));

// JWT SOON (WIP)

/* =========================== MIDDLEWARE ========================== */

// Parse application/json
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limit - 5 requests per second
const limiter = rateLimit({
  windowMs: 30000,
  max: 10,
  message: "Too many requests, please try again later.",
  statusCode: 429,
});
app.use(limiter);
app.set("trust proxy", 1);

// Check if database is connected
app.use((req: Request, res: Response, next: any) => {
  if (isConnected()) {
    next();
  } else {
    res.status(500).json({
      error: "[ERROR/DB] Database is not connected, API is not available.",
    });
  }
});

/* =========================== HEALTH & 404 ========================== */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    uptime: "OK Since " + new Date(serverStartTime).toLocaleString() + " UTC",
    database: isConnected(),
  });
});

app.get("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "[ERROR/ROUTE] Route not found",
  });
});

/* =========================== ROUTES ========================== */

// Routes soon (WIP)

/* =========================== START ========================== */

try {
  if (!port)
    throw new Error("[ERROR/SERVER] Port is not defined, check .env file");

  app.listen(port, () => {
    console.log(`[INFO] Server is up and running on port ${port}`);
  });
} catch (error) {
  console.log("[ERROR/SERVER] Server failed to start", error);
}
