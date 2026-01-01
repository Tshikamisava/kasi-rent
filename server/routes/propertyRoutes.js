import express from "express";
import multer from "multer";
import { getProperties, createProperty, verifyProperty } from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getProperties);
router.post("/", protect, authorizeRole(['landlord','admin']), upload.single("image"), createProperty);
router.patch("/:id/verify", protect, verifyProperty);

export default router;