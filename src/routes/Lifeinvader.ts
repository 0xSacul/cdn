import express from "express";
import { getFile } from "../controllers/LifeInvader.controller";

const LifeInvader = express.Router();
console.log("[INFO] Life Invader routes loaded");

// Routes soon (WIP)
LifeInvader.get("/:server/:owner/:filename", getFile);

export default LifeInvader;
