import express from "express";
import {
  generatePropertyDescription,
  generatePropertyTitle,
  suggestOptimalPrice,
} from "../controllers/descriptionGeneratorController.js";

const router = express.Router();

// Generate description for property
router.post("/description", generatePropertyDescription);

// Generate optimized title
router.post("/title", generatePropertyTitle);

// Suggest optimal price
router.post("/suggest-price", suggestOptimalPrice);

export default router;
