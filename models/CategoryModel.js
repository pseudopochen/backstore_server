import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentID: { type: String, required: true, defaul: "0" },
});

const CategoryModel = mongoose.model("categories", categorySchema);

export default CategoryModel;
