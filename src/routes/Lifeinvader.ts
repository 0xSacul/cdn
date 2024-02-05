import express from "express";
import {
  getFile,
  uploadFile,
  deleteFile,
} from "../controllers/LifeInvader.controller";

const LifeInvader = express.Router();
console.log("[INFO] Life Invader routes loaded");

// Routes soon (WIP)
LifeInvader.get("/:server/:owner/:filename", getFile);
LifeInvader.post("/:server/:owner", uploadFile);
LifeInvader.delete("/:server/:owner/:filename", deleteFile);

export default LifeInvader;
