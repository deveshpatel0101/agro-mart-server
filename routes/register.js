const router = require('express').Router();
const validator = require('validator');
const bcrypt = require('bcryptjs');

const User = require('../model/user');
const regEx = '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})';

router.post('/', (req, res) => {
    let userObj = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        userType: req.body.userType,
        position: req.body.position
    };
    if (!userObj.username || userObj.username.length < 3) {
        res.status(200).json({
            errorMessage: 'username must be at least 3 characters long.',
            errorName: true
        });
    } else if (!validator.isEmail(userObj.email)) {
        res.status(200).json({
            errorMessage: 'not a valid email.',
            errorEmail: true
        });
    } else if (!validator.matches(userObj.password, regEx)) {
        res.status(200).json({
            errorMessage: 'password should be 6 characters long and should include atleast one uppercase letter or numeric character.',
            errorPassword: true
        });
    } else if (userObj.password !== req.body.confirmPassword) {
        res.status(200).json({
            errorMessage: 'both passwords should match.',
            errorConfirmPassword: true
        });
    } else if (!userObj.userType) {
        return res.status(200).json({
            error: true,
            errorMessage: 'not a valid user type'
        });
    } else if (userObj.userType !== 'farmer' && userObj.userType !== 'customer') {
        return res.status(200).json({
            errorUserType: true,
            errorMessage: 'not a valid user type. it must be a farmer or customer'
        });
    } else if (!userObj.position || !userObj.position.latitude || !userObj.position.longitude) {
        return res.status(200).json({
            errorPosition: true,
            errorMessage: 'user location is required for new user'
        });
    } else {
        User.findOne({ email: userObj.email }).then(result => {
            if (result) {
                res.status(200).json({
                    errorMessage: 'user already exist.',
                    errorEmail: true
                });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        res.status(200).json({
                            error: true,
                            errorMessage: err.message
                        });
                    } else {
                        bcrypt.hash(userObj.password, salt, (err, hash) => {
                            if (err) {
                                res.status(200).json({
                                    error: true,
                                    errorMessage: err.message
                                });
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