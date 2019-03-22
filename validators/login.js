const Joi = require('joi');
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,}$/;

module.exports.loginSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().regex(passwordRegex).required()
}