import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  categoryID: { type: String, required: true },
  pCategoryID: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: { type: String },
  status: { type: Number, default: 1 },
  imgs: { type: Array, default: [] },
  detail: { type: String },
});

const ProductModel = mongoose.model("products", productSchema);
export default ProductModel;
