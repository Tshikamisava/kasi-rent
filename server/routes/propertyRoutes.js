import express from "express";
import multer from "multer";
import { getProperties, createProperty } from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getProperties);
router.post("/", protect, authorizeRole(['landlord','admin']), upload.single("image"), createProperty);

export default router;