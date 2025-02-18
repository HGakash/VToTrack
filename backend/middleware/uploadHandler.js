import multer from "multer";
import path from "path";

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // Store files in "uploads/" folder
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`), // Unique file name
});

// File filter (only allow specific types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only PDF and Word documents are allowed!"), false);
};

// Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

export default upload;
