import express from "express";
import {
  getRecommendations,
  trackPropertyView,
  getTrendingProperties,
  getSimilarProperties,
} from "../controllers/recommendationsController.js";

const router = express.Router();

// Get personalized recommendations
router.post("/personalized", getRecommendations);

// Track property view
router.post("/track-view", trackPropertyView);

// Get trending properties
router.post("/trending", getTrendingProperties);

// Get similar properties
router.post("/similar", getSimilarProperties);

export default router;
