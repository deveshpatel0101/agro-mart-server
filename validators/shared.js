const Joi = require('joi');

module.exports.sharedSchema = {
  blogId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  values: Joi.object({
    shared: Joi.boolean().required(),
  }).required(),
};
