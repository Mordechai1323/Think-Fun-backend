const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  name: String,
  category_id: String,
  img_url: String,
});

exports.CategoryModel = mongoose.model("categories", categorySchema);

exports.validateCategory = (reqBody) => {
  reqBody.name = reqBody.name?.replace(/[^A-Za-zא-ת0-9\s\-_]/g, ' ');
  reqBody.category_id = reqBody.category_id?.replace(/[^A-Za-z0-9\s\-_]/g, ' ');
  reqBody.img_url = reqBody?.img_url?.replace(/[^A-Za-z0-9\s\-_]/g, ' ');

  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(300).required(),
    category_id: Joi.string().min(2).max(300).required(),
    img_url: Joi.string().min(2).max(300).allow(null, ""),
  });
  return joiSchema.validate(reqBody);
};
