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
            error: true,
            errorType: 'username',
            errorMessage: 'Username must be at least 3 characters long.',
        });
    } else if (!validator.isEmail(userObj.email)) {
        res.status(200).json({
            error: true,
            errorType: 'email',
            errorMessage: 'Not a valid email.',
        });
    } else if (!validator.matches(userObj.password, regEx)) {
        res.status(200).json({
            error: true,
            errorType: 'password',
            errorMessage: 'Password should be at least 6 characters long and should include at least one uppercase letter or numeric character.',
        });
    } else if (userObj.password !== req.body.confirmPassword) {
        res.status(200).json({
            error: true,
            errorType: 'confirmPassword',
            errorMessage: 'Both passwords should match.',
        });
    } else if (!userObj.userType || (userObj.userType !== 'farmer' && userObj.userType !== 'customer')) {
        return res.status(200).json({
            error: true,
            errorType: 'userType',
            errorMessage: 'Not a valid user type. It must either a farmer or customer.'
        });
    } else if (!userObj.position || !userObj.position.latitude || !userObj.position.longitude) {
        return res.status(200).json({
            error: true,
            errorType: 'position',
            errorMessage: 'Not a valid position. It must include latitude and longitude parameters.'
        });
    } else {
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
    }
});

module.exports = router;