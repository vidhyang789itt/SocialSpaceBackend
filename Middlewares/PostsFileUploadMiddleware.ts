import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "SocialSpaceUploads",
      resource_type: isVideo ? "video" : "image",
      public_id: Date.now() + "-" + Math.round(Math.random() * 1e9),
    };
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg|mov|avi|mkv/;

  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase())
    ? "image"
    : allowedVideoTypes.test(path.extname(file.originalname).toLowerCase())
      ? "video"
      : null;

  const mimetype = file.mimetype.startsWith("image/")
    ? "image"
    : file.mimetype.startsWith("video/")
      ? "video"
      : null;

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error("Only image and video files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});