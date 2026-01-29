import express from "express";
import { analyzePropertyForFraud, batchAnalyzeProperties } from "../controllers/fraudDetectionController.js";

const router = express.Router();

// Analyze single property for fraud
router.post("/analyze", analyzePropertyForFraud);

// Batch analyze multiple properties
router.post("/batch-analyze", batchAnalyzeProperties);

export default router;
