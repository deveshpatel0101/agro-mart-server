const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');
const Joi = require('joi');
const config = require('config');

const User = require('../model/user');
const Shared = require('../model/shared');
const { loginSchema } = require('../validators/login');

router.post('/', (req, res) => {
    const result = Joi.validate(req.body, loginSchema);
    if (result.error) {
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
                        userType: result.userType
                    }
                    const jwtToken = jwt.sign(jwtPayload, config.get('jwtKey'), { expiresIn: '1h' });
                    if (result.userType === 'farmer') {
                        return res.status(200).json({
                            error: false,
                            jwtToken,
                            blogs: result.blogs
                        });
                    } else if (result.userType === 'customer') {
                        const currPosition = result.position;
                        let blogs = [];
                        Shared.find().limit(20).then(resultShared => {
                            for (let i = 0; i < resultShared.length; i++) {
                                const distance = geolib.getDistance(currPosition, resultShared[i].position);
                                console.log(distance);
                                if (distance < 6000) {
                                    blogs.push(resultShared[i]);
                                }
                            }
                            return res.status(200).json({
                                error: false,
                                jwtToken,
                                blogs
                            });
                        }).catch(err => {
                            return res.status(200).json({
                                error: true,
                                errorType: 'unexpected',
                                errorMessage: err
                            });
                        });
                    }
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