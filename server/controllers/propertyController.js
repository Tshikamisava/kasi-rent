import Property from "../models/Property.js";
import cloudinary from "../config/cloudinary.js";

// Get all properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create property with Cloudinary upload
export const createProperty = async (req, res) => {
  try {
    const { title, description, price, location } = req.body;
    const imageFile = req.file;

    let imageUrl = "";
    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, { folder: "kasirent" });
      imageUrl = result.secure_url;
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      images: [imageUrl],
      user: req.user._id
    });

    const saved = await property.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
