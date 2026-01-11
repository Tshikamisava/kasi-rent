import express from 'express';
import { videoUpload } from '../config/videoUpload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload single video
router.post('/single', videoUpload.single('video'), async (req, res) => {
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

// Delete video
router.delete('/:filename', async (req, res) => {
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
        message: 'Video file not found'
      });
    }
  } catch (error) {
    console.error('Video delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
});

export default router;
