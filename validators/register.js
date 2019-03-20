const Joi = require('joi');

const passwordRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

module.exports.registerSchema = {
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().regex(passwordRegex).required(),
    confirmPassword: Joi.equal(Joi.ref('password')).required(),
    userType: Joi.string().regex(/^farmer$|^customer$/).required(),
    position: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    accountType: Joi.string().regex(/^local$|^google$/).required()
}