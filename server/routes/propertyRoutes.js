import express from "express";
import { getProperties, createProperty, verifyProperty, updateProperty, deleteProperty } from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", getProperties);
router.post("/", createProperty);
router.patch("/:id/verify", verifyProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;