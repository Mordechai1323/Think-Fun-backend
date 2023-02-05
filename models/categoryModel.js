const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  name: String,
  category_id: String,
  img_url: String,
});

exports.CategoryModel = mongoose.model("categories", categorySchema);

exports.validateCategory = (reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(300).required(),
    category_id: Joi.string().min(2).max(300).required(),
    img_url: Joi.string().min(2).max(300).allow(null, ""),
  });
  return joiSchema.validate(reqBody);
};
