import express from "express";
import { upload } from "../Middlewares/PostsFileUploadMiddleware";
import { uploadFile, uploadMultipleFiles } from "../Controllers/uploadController";

const router = express.Router();

router.post("/", upload.single("file"), uploadFile);

router.post("/upload-multiple", upload.array("files", 10), uploadMultipleFiles);

export default router;