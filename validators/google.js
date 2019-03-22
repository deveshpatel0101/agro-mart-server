const Joi = require('joi');

module.exports.googleSchema = {
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    profileImage: Joi.string(),
    refreshToken: Joi.string(),
    accountType: Joi.string().regex(/^google$/).required(),
    googleId: Joi.number(),
    accessToken: Joi.string().required(),
    position: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    userType: Joi.string().regex(/^farmer$|^customer$/).required(),
    blogs: Joi.array().length(0).required()
}