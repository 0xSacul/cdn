import { Request, Response } from "express";
import LifeInvaderFile from "../models/LifeInvaderFile";

const getContentTypes = (filename: string) => {
  const types = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
    ".bz2": "application/x-bzip2",
    ".xz": "application/x-xz",
    ".exe": "application/x-msdownload",
    ".apk": "application/vnd.android.package-archive",
    ".iso": "application/x-iso9660-image",
    ".torrent": "application/x-bittorrent",
  };

  const ext = filename.split(".").pop();
  return types[`.${ext}` as keyof typeof types];
};

export const getFile = async (req: Request, res: Response) => {
  const { server, owner, filename } = req.params;

  if (!server || !owner || !filename)
    return res.status(400).json({ error: "[ERROR/REQ] Missing parameters" });

  try {
    const file = `${process.cwd()}/uploads/lifeinvader/${server}/${owner}/${filename}`;

    const fileExists = await LifeInvaderFile.findOne({
      server,
      owner,
      filename,
    });

    if (!fileExists)
      return res.status(404).json({ error: "[ERROR/FILE] File not found" });

    await LifeInvaderFile.updateOne(
      { server, owner, filename },
      { $inc: { views: 1 } }
    );

    return res
      .status(200)
      .set("Content-Type", getContentTypes(filename))
      .sendFile(file);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "[ERROR/INTERNAL] Internal Server Error", trace: error });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const paths = (req.files as Express.Multer.File[])?.map(
      (file: Express.Multer.File) =>
        `https://cdn.sacul.cloud/lifeinvader/${req.params.server}/${req.params.owner}/${file.filename}`
    );

    for (const file of req.files as Express.Multer.File[]) {
      const { server, owner } = req.params;
      const { originalname: filename, size } = file;
      const fileData = new LifeInvaderFile({
        server,
        owner,
        filename,
        size,
        path: `https://cdn.sacul.cloud/lifeinvader/${server}/${owner}/${filename}`,
        views: 0,
      });
      await fileData.save();
    }

    return res.status(200).json({ message: "Files uploaded", paths });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "[ERROR/INTERNAL] Internal Server Error", trace: error });
  }
};

/* export const uploadFile = async (req: Request, res: Response) => {
  const { server, owner } = req.params;
  const { files } = req.body;

  console.log("server", server);
  console.log("owner", owner);
  console.log("files", files);

  if (!server || !owner || !files)
    return res.status(400).json({ error: "[ERROR/REQ] Missing parameters" });

  try {
    const upload = multer({ storage: multerStorage }).array("files");
    upload(req, res, (err: any) => {
      if (err)
        return res.status(500).json({ error: "[ERROR/FILE] File upload" });
    });

    const paths = [];
    for (const file of files) {
      console.log(file);
      const { name, size, metadata } = file;
      const fileData = new LifeInvaderFile({
        server,
        owner,
        filename: name,
        size,
        path:
          "https://cdn.sacul.cloud/lifeinvader/" +
          server +
          "/" +
          owner +
          "/" +
          name,
        metadata,
        views: 0,
      });
      await fileData.save();
      paths.push(
        `https://cdn.sacul.cloud/lifeinvader/${server}/${owner}/${name}`
      );
    }

    return res.status(200).json({ message: "Files uploaded", paths });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "[ERROR] Error with /upload route.", message: error });
  }
}; */

export const deleteFile = async (req: Request, res: Response) => {
  const { server, owner, filename } = req.params;

  if (!server || !owner || !filename)
    return res.status(400).json({ error: "[ERROR/REQ] Missing parameters" });

  try {
    // Delete file from database
    const file = await LifeInvaderFile.findOneAndDelete({
      server,
      owner,
      filename,
    });

    if (!file)
      return res.status(404).json({ error: "[ERROR/FILE] File not found" });

    return res.status(200).json({ message: "File deleted" });
  } catch (error) {
    return res.status(500).json({ error: "[ERROR/DB] Database error" });
  }
};
