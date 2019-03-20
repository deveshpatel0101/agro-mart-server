const Joi = require('joi');

module.exports.createBlogSchema = {
    id: Joi.string().min(5).max(1024).required(),
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    createdAt: Joi.date().required(),
    lastModified: Joi.date().required(),
    shared: Joi.boolean().equal(false).required()
}

module.exports.updateBlogSchema = {
    blogId: Joi.string().min(5).max(1024).required(),
    values: Joi.object({
        title: Joi.string().min(3),
        description: Joi.string().min(3),
        createdAt: Joi.date(),
        lastModified: Joi.date()
    }).required().disallow(["shared"])
}

module.exports.deleteBlogSchema = {
    blogId: Joi.string().min(5).max(50).required()
}