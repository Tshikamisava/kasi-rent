import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/properties');
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage (temporary location)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'temp-' + uniqueSuffix + ext);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for original file
  },
  fileFilter: fileFilter
});

// Compress and optimize image
export const compressImage = async (tempFilePath, filename) => {
  const outputPath = path.join(uploadsDir, filename);
  
  try {
    const image = sharp(tempFilePath);
    const metadata = await image.metadata();
    
    console.log(`Processing image: ${filename}, format: ${metadata.format}`);
    
    // Resize and optimize based on original format
    await image
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    
    console.log(`Successfully processed: ${filename}`);
    
    // Wait a bit before deleting temp file to avoid file locking issues
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Delete temp file with retry
    try {
      fs.unlinkSync(tempFilePath);
    } catch (unlinkError) {
      console.warn(`Could not delete temp file ${tempFilePath}, will be cleaned up later`);
    }
    
    return outputPath;
  } catch (error) {
    console.error('Compression error for', filename, ':', error.message);
    
    // If compression fails, try to copy the file instead of renaming
    try {
      // Wait a bit for any file locks to release
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Copy instead of rename to avoid EBUSY errors
      fs.copyFileSync(tempFilePath, outputPath);
      
      // Try to delete temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn(`Could not delete temp file after copy: ${tempFilePath}`);
      }
      
      console.log(`Copied original file: ${filename}`);
      return outputPath;
    } catch (copyError) {
      console.error('Failed to copy file:', copyError);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }
};

// Helper function to delete file
export const deleteFile = (filename) => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
