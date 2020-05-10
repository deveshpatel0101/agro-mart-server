const Joi = require('joi');

module.exports.sharedSchema = {
  itemId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  values: Joi.object({
    shared: Joi.boolean().required(),
  }).required(),
};

module.exports.getSharedItemsSchema = {
  q: Joi.string(),
  page: Joi.number().min(1),
  per_page: Joi.number().min(0).max(100)
}