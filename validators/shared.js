const Joi = require('joi');

module.exports.sharedSchema = {
    blogId: Joi.string().min(5).max(1024).required(),
    values: Joi.object({
        shared: Joi.boolean().required()
    }).required(),
}