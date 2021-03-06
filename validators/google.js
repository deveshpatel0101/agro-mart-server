const Joi = require('joi');

module.exports.googleSchema = {
  username: Joi.string()
    .min(3)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  accountType: Joi.string()
    .regex(/^google$/)
    .required(),
  googleId: Joi.string().required(),
  accessToken: Joi.string().required(),
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
