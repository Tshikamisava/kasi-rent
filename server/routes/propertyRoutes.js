import express from "express";
import { getProperties, createProperty, verifyProperty } from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", getProperties);
router.post("/", createProperty); // Removed auth temporarily for testing
router.patch("/:id/verify", protect, verifyProperty);

export default router;