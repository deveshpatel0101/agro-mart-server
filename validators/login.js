const Joi = require('joi');

module.exports.loginSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().required()
}