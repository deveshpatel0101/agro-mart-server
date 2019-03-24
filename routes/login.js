const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('config');

const User = require('../model/user');
const { loginSchema } = require('../validators/login');

router.post('/', (req, res) => {
    const result = Joi.validate(req.body, loginSchema);
    if (result.error) {
        if (result.error.details[0].path[0] === 'password') {
            return res.status(200).json({
                error: true,
                errorType: result.error.details[0].path[0],
                errorMessage: 'Password is required and should be at least 6 characters long and should include at least one uppercase letter and a numeric character.'
            });
        }
        return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            errorMessage: result.error.details[0].message
        });
    }

    User.findOne({ email: req.body.email }).then(result => {
        if (!result) {
            return res.status(200).json({
                error: true,
                errorType: 'email',
                errorMessage: 'User does not exist.'
            });
        } else {
            bcrypt.compare(req.body.password, result.password, (err, isPasswordCorrect) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        errorType: 'unexpected',
                        errorMessage: err
                    });
                } else if (!isPasswordCorrect) {
                    return res.status(200).json({
                        error: true,
                        errorType: 'password',
                        errorMessage: 'Wrong password.'
                    });
                } else {
                    const jwtPayload = {
                        id: result.id,
                        loggedIn: true,
                    }
                    const jwtToken = jwt.sign(jwtPayload, config.get('jwtKey'), { expiresIn: '1h' });
                    return res.status(200).json({
                        error: false,
                        jwtToken,
                        blogs: result.blogs
                    });
                }
            });
        }
    }).catch(err => {
        return res.status(200).json({
            error: true,
            errorType: 'unexpected',
            errorMessage: err
        });
    });
});

module.exports = router;