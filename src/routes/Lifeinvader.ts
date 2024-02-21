import express from "express";
import { getFile, uploadFile } from "../controllers/LifeInvader.controller";

import { uploadLifeInvader } from "..";
const LifeInvader = express.Router();
console.log("[INFO] Life Invader routes loaded");

//LifeInvader.get("/:server/:owner/:filename", getFile);
LifeInvader.post(
  "/:server/:owner",
  uploadLifeInvader.array("files", 10), // 10 files max
  uploadFile
);
//LifeInvader.delete("/:server/:owner/:filename", deleteFile);

export default LifeInvader;
