"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFiles = exports.uploadFile = void 0;
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        const file = req.file;
        const fileUrl = `/uploads/${file.filename}`;
        res.json({
            success: true,
            url: fileUrl,
            filePath: fileUrl,
            fileName: file.originalname,
            fileSize: file.size,
            mimetype: file.mimetype,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "File upload failed",
            error: error.message
        });
    }
};
exports.uploadFile = uploadFile;
const uploadMultipleFiles = async (req, res) => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }
        const files = Array.isArray(req.files) ? req.files : [req.files];
        const uploadedFiles = files.map((file) => ({
            url: `/uploads/${file.filename}`,
            filePath: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            mimetype: file.mimetype,
        }));
        res.json({
            success: true,
            files: uploadedFiles,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "File upload failed",
            error: error.message
        });
    }
};
exports.uploadMultipleFiles = uploadMultipleFiles;
