import { Response } from "express";
import { CustomRequest } from "../Types/CustomRequestType";

export const uploadFile = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const file = req.file;

    const fileUrl = file.path;

    res.json({
      success: true,
      url: fileUrl,
      filePath: fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimetype: file.mimetype,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
};

export const uploadMultipleFiles = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];

    const uploadedFiles = files.map((file: any) => ({
      url: file.path,
      filePath: file.path,
      fileName: file.originalname,
      fileSize: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
};