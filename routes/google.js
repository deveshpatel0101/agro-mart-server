const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('config');
const fetch = require('node-fetch');

const User = require('../model/user');
const { googleSchema } = require('../validators/google');

router.post('/register', (req, res) => {
  let googleUser = {
    ...req.body,
    accountType: 'google',
    items: [],
  };
  const result = Joi.validate(googleUser, googleSchema);
  if (result.error) {
    return res.status(400).json({
      error: true,
      errorType: result.error.details[0].path[0],
      errorMessage: result.error.details[0].message,
    });
  }

  User.findOne({ email: googleUser.email })
    .then((result) => {
      if (result) {
        return res.status(400).json({
          error: true,
          errorType: 'email',
          errorMessage: 'User already exists!',
        });
      }

      // validate access token
      fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${googleUser.accessToken}`)
        .then((tokenRes) => {
          return tokenRes.json();
        })
        .then((tokenRes) => {
          if (tokenRes.error) {
            return res.status(200).json({
              error: true,
              errorType: 'accessToken',
              errorMessage: 'Invalid access token',
            });
          } else {
            const validate = validateToken(tokenRes, googleUser);
            if (validate.error) {
              return res.status(400).json({
                ...validate,
              });
            }
            new User(googleUser)
              .save()
              .then((savedResult) => {
                const jwtToken = generateJwt(savedResult.id);
                return res.status(200).json({
                  error: false,
                  jwtToken,
                  items: [],
                });
              })
              .catch((err) => {
                return res.status(500).json({
                  error: true,
                  errorType: 'unexpected',
                  errorMessage: err,
                });
              });
          }
        })
        .catch((err) => {
          return res.status(500).json({
            error: true,
            errorType: 'unexpected',
            errorMessage: err,
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

router.post('/login', (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    return res.status(400).json({
      error: true,
      errorType: 'accessToken',
      errorMessage: 'Access Token not found.',
    });
  }

  fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`)
    .then((tokenRes) => {
      return tokenRes.json();
    })
    .then((tokenRes) => {
      if (tokenRes.error || tokenRes.issued_to !== config.get('googleClientId')) {
        return res.status(400).json({
          error: true,
          errorType: 'accessToken',
          errorMessage: 'Invalid access token',
        });
      }
      User.findOne({ email: tokenRes.email })
        .then((response) => {
          if (!response) {
            return res.status(400).json({
              error: true,
              errorType: 'email',
              errorMessage: 'User does not exist.',
            });
          }
          return res.status(200).json({
            error: false,
            jwtToken: generateJwt(response.id),
            items: response.items,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: true,
            errorType: 'unexpected',
            errorMessage: err,
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
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

function validateToken(tokenData, googleUser) {
  const { issued_to, verified_email, user_id, email } = tokenData;
  const error =
    !verified_email ||
    user_id !== googleUser.googleId ||
    email !== googleUser.email ||
    issued_to !== config.get('googleClientId');

  if (error) {
    return {
      error: true,
      errorType: 'accessToken',
      errorMessage: 'Invalid access token.',
    };
  }
  return true;
}

module.exports = router;
