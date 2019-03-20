const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const User = require('../model/user');
const { registerSchema } = require('../validators/register');
router.post('/', (req, res) => {
    let userObj = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userType: req.body.userType,
        position: req.body.position,
        accountType: 'local'
    };
    const result = Joi.validate(userObj, registerSchema);
    if (result.error) {
        if (result.error.details[0].path[0] === 'password') {
            return res.status(200).json({
                error: true,
                errorType: result.error.details[0].path[0],
                errorMessage: 'Password should be at least 6 characters long and should include at least one uppercase letter or numeric character.'
            });
        } else if (result.error.details[0].path[0] === 'confirmPassword') {
            return res.status(200).json({
                error: true,
                errorType: result.error.details[0].path[0],
                errorMessage: 'Both passwords should match.'
            });
        } else if (result.error.details[0].path[0] === 'userType') {
            return res.status(200).json({
                error: true,
                errorType: result.error.details[0].path[0],
                errorMessage: 'Not a valid user type. It must either a farmer or customer.'
            });
        }
        return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            errorMessage: result.error.details[0].message
        });
    }

    User.findOne({ email: userObj.email }).then(result => {
        if (result) {
            res.status(200).json({
                error: true,
                errorType: 'email',
                errorMessage: 'User already exist.',
            });
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    res.status(200).json({
                        error: true,
                        errorType: 'unexpected',
                        errorMessage: err
                    });
                } else {
                    bcrypt.hash(userObj.password, salt, (err, hash) => {
                        if (err) {
                            res.status(200).json({
                                error: true,
                                errorType: 'unexpected',
                                errorMessage: err
                            });
                        } else {
                            userObj.password = hash;
                            new User(userObj).save().then(() => {
                                res.status(200).json({
                                    error: false,
                                    successMessage: 'User created successfully. You can now login.'
                                });
                            }).catch(err => {
                                res.status(200).json({
                                    error: true,
                                    errorType: 'unexpected',
                                    errorMessage: err
                                });
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;