import mongoose from "mongoose";

const lifeInvaderSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const LifeInvaderFile = mongoose.model("lifeinvader", lifeInvaderSchema);
export default LifeInvaderFile;
