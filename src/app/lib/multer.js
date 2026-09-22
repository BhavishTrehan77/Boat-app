import multer from "multer";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

// Folder where uploaded images and documents will be saved
const UPLOAD_DIR = "./public/uploads";

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Clean the original filename and add a timestamp to avoid conflicts
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    cb(null, uniqueFileName);
  },
});

// 2. Allowed file types: Images (JPG, PNG, WEBP, GIF) and PDF documents
function fileFilter(req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images (JPG, PNG, WEBP) and PDF files are allowed."),
      false
    );
  }
}

// 3. Initialize Multer instance with 5MB file limit
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// 4. Helper function to run Multer inside Next.js App Router route handlers
export async function runMulter(request, fieldName = "file") {
  const contentType = request.headers.get("content-type") || "";
  
  if (!contentType.includes("multipart/form-data")) {
    throw new Error("Request must be multipart/form-data");
  }

  // Convert incoming Web Request body to Node buffer
  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create a Node readable stream that Multer can process
  const streamReq = Readable.from(buffer);
  streamReq.headers = {
    "content-type": contentType,
    "content-length": buffer.length,
  };

  // Run Multer middleware as a Promise
  return new Promise((resolve, reject) => {
    const middleware = upload.single(fieldName);
    const mockRes = {};

    middleware(streamReq, mockRes, (err) => {
      if (err) {
        return reject(err);
      }
      resolve({
        file: streamReq.file,
        body: streamReq.body || {},
      });
    });
  });
}

export default upload;
