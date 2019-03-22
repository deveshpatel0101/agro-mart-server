const Joi = require('joi');

module.exports.createBlogSchema = {
    blogId: Joi.string().guid({ version: ["uuidv4"] }).required(),
    title: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    createdAt: Joi.date().required(),
    lastModified: Joi.date().required(),
    shared: Joi.boolean().equal(false).required()
}

module.exports.updateBlogSchema = {
    blogId: Joi.string().guid({ version: ["uuidv4"] }).required(),
    values: Joi.object({
        title: Joi.string().min(1),
        description: Joi.string().min(1),
        createdAt: Joi.date(),
        lastModified: Joi.date()
    }).required()
}

module.exports.deleteBlogSchema = {
    blogId: Joi.string().guid({ version: ["uuidv4"] }).required()
}