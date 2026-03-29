import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '../uploads/documents');
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /\.pdf$|\.jpeg$|\.jpg$|\.png$|\.tiff$|\.tif$|\.jfif$|\.webp$|\.heic$|\.heif$/i;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isPdf = mime === 'application/pdf' || ext === '.pdf';
  const isImage = mime.startsWith('image/') || allowedExt.test(ext);

  if (isPdf || isImage) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or image documents are allowed (JPG, PNG, WEBP, HEIC, etc.)'));
  }
};

export const docUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter
});

// Move file from temp to docs directory (no image compression)
export const finalizeDocument = (tempPath, filename) => {
  const dest = path.join(docsDir, filename);
  try {
    fs.renameSync(tempPath, dest);
    return `/uploads/documents/${filename}`;
  } catch (err) {
    // Fallback to copy
    fs.copyFileSync(tempPath, dest);
    try { fs.unlinkSync(tempPath); } catch (e) {}
    return `/uploads/documents/${filename}`;
  }
};
