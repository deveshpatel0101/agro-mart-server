const router = require('express').Router();
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const regEx = '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})';

router.post('/', (req, res) => {
    if (req.body.username.length < 3) {
        res.status(200).json({
            errorMessage: 'username must be at least 3 characters long.',
            errorName: true
        });
    } else if (!validator.isEmail(req.body.email)) {
        res.status(200).json({
            errorMessage: 'not a valid email.',
            errorEmail: true
        });
    } else if (!validator.matches(req.body.password, regEx)) {
        res.status(200).json({
            errorMessage: 'password should be 6 characters long and should include atleast one uppercase letter or numeric character.',
            errorPassword: true
        });
    } else if (req.body.password !== req.body.confirmPassword) {
        res.status(200).json({
            errorMessage: 'both passwords should match.',
            errorConfirmPassword: true
        });
    } else {
        User.findOne({ email: req.body.email }).then(result => {
            if (result) {
                res.status(200).json({
                    errorMessage: 'user already exist.',
                    errorEmail: true
                });
            } else {
                let userObj = {
                    email: 'wrong12@gmail.com',
                    username: req.body.username,
                    password: req.body.password
                };
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        res.status(200).json({
                            error: true,
                            errorMessage: err.message
                        });
                    } else {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) {
                                res.status(200).json({
                                    error: true,
                                    errorMessage: err.message
                                })
                            } else {
                                userObj.password = hash;
                                new User(userObj).save().then(() => {
                                    res.status(200).json({
                                        success: true,
                                        successMessage: 'user created successfully.'
                                    });
                                }).catch(error => {
                                    res.status(200).json({
                                        error: true,
                                        errorMessage: error.message
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;