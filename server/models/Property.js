import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    images: [{ type: String }]
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
export default Property;
