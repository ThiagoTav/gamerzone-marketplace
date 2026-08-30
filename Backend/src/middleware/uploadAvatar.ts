import crypto from "crypto";
import path from "path";
import multer from "multer";

const UPLOAD_DIR = path.join(__dirname, "../../uploads/avatars");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});
