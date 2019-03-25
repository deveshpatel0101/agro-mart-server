const router = require('express').Router();
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Joi = require('joi');
const config = require('config');

const User = require('../model/user');
const { googleSchema } = require('../validators/google');

router.post('/', (req, res) => {
  let googleUser = {
    ...req.body,
    accountType: 'google',
    blogs: [],
  };
  if (!googleUser.email) {
    return res.status(200).json({
      error: true,
      errorType: 'email',
      errorMessage: '"email" is required.',
    });
  } else if (!validator.isEmail(googleUser.email)) {
    return res.status(200).json({
      error: true,
      errorType: 'email',
      errorMessage: '"email" must be valid.',
    });
  }
  User.findOne({ email: googleUser.email })
    .then(result => {
      if (!result) {
        const result = Joi.validate(googleUser, googleSchema);
        if (result.error) {
          return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            problem: 'user does not exist',
            errorMessage: result.error.details[0].message,
          });
        }

        new User(googleUser)
          .save()
          .then(savedResult => {
            const jwtToken = generateJwt(savedResult.id);
            return res.status(200).json({
              error: false,
              jwtToken,
              blogs: [],
            });
          })
          .catch(err => {
            return res.status(200).json({
              error: true,
              errorType: 'unexpected',
              errorMessage: err,
            });
          });
      } else {
        const jwtToken = generateJwt(result.id);
        return res.status(200).json({
          error: false,
          jwtToken,
          blogs: result.blogs,
        });
      }
    })
    .catch(err => {
      return res.status(200).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

function generateJwt(id) {
  let newUser = {
    id: id,
    loggedIn: true,
  };
  let jwtToken = jwt.sign(newUser, config.get('jwtKey'), { expiresIn: '1h' });
  return jwtToken;
}

module.exports = router;
