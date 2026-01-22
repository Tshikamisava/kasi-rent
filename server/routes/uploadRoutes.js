import express from 'express';
import { upload, compressImage } from '../config/upload.js';
import { docUpload, finalizeDocument } from '../config/docUpload.js';
import { videoUpload } from '../config/videoUpload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload single image
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Compress and optimize the image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'property-' + uniqueSuffix + '.jpg';
    
    await compressImage(req.file.path, filename);

    const imageUrl = `/uploads/properties/${filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: filename,
      originalSize: req.file.size,
      message: 'Image uploaded and optimized'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Compress all images
    const imageUrls = [];
    const compressedFiles = [];
    
    for (const file of req.files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'property-' + uniqueSuffix + '.jpg';
      
      await compressImage(file.path, filename);
      
      imageUrls.push(`/uploads/properties/${filename}`);
      compressedFiles.push({
        filename: filename,
        originalSize: file.size,
        originalName: file.originalname
      });
    }
    
    res.json({
      success: true,
      imageUrls: imageUrls,
      count: imageUrls.length,
      files: compressedFiles,
      message: 'Images uploaded and optimized'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// Delete image
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/properties', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// Upload video
router.post('/video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    res.json({
      success: true,
      videoUrl: videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
});

// Upload landlord document (ID, proof)
router.post('/document', docUpload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No document uploaded' });

    const filename = req.file.filename;
    const finalUrl = finalizeDocument(req.file.path, filename);

    res.json({ success: true, documentUrl: finalUrl, filename, originalName: req.file.originalname });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
  }
});

// Delete video
router.delete('/video/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/videos', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
});

export default router;
