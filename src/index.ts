import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT;
const serverStartTime = Date.now();

/* =========================== DATABASE ========================== */
import { connect, isConnected } from "./database/client";
connect();

/* =========================== CORS ========================== */
const corsWhitelist = [
  "http://localhost:3000",
  "https://lifeinvader.visionrp.fr",
];
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("[ERROR/CORS] Not allowed by CORS: " + origin));
    }
  },
  methods: "GET,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

/* =========================== MIDDLEWARE ========================== */

// Parse application/json
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Rate limit - 5 requests per second for POST requests
// Unlimitted requests for GET requests
const limiter = rateLimit({
  windowMs: 1000,
  max: 5,
  skip: (req: Request) => {
    return req.method === "GET";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "[ERROR/LIMITER] Too many requests, please try again later.",
    });
  },
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

/* =========================== MULTER ========================== */
const multerStorageLifeInvader = multer.diskStorage({
  destination: (req, file, cb) => {
    const { server, owner } = req.params;
    const path = `${process.cwd()}/uploads/lifeinvader/${server}/${owner}`;

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const uploadLifeInvader = multer({ storage: multerStorageLifeInvader });

/* =========================== HEALTH & 404 ========================== */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    uptime: "OK Since " + new Date(serverStartTime).toLocaleString() + " UTC",
    database: isConnected(),
  });
});

/* =========================== STATIC ========================== */
app.use("/lifeinvader", express.static("uploads/lifeinvader"));

/* =========================== ROUTES ========================== */

import Base from "./routes/Base";
import LifeInvader from "./routes/Lifeinvader";

app.use("/", Base);
app.use("/lifeinvader", LifeInvader);

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
