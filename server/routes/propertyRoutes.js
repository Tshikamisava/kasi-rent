import express from "express";
import { getProperties, createProperty, verifyProperty, updateProperty, deleteProperty } from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", getProperties);
	router.post("/", protect, createProperty);
	router.put("/:id", protect, updateProperty);
router.delete("/:id", deleteProperty);
router.patch("/:id/verify", protect, verifyProperty);

export default router;