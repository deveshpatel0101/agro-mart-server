const Joi = require('joi');

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,}$/;

module.exports.registerSchema = {
  username: Joi.string()
    .min(3)
    .max(50)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .regex(passwordRegex)
    .required(),
  confirmPassword: Joi.equal(Joi.ref('password')).required(),
  position: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required(),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required(),
  }).required(),
  items: Joi.array()
    .length(0)
    .required(),
};
