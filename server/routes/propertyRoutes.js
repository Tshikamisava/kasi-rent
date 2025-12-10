import express from "express";
import multer from "multer";
import { getProperties, createProperty } from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getProperties);
router.post("/", protect, upload.single("image"), createProperty);

export default router;