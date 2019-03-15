const router = require('express').Router();
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');

const User = require('../model/user');
const Shared = require('../model/shared');

router.post('/', (req, res) => {
    if (!validator.isEmail(req.body.email)) {
        return res.status(200).json({
            errorEmail: true,
            errorMessage: 'not a valid email'
        });
    } else {
        User.findOne({ email: req.body.email }).then(result => {
            if (!result) {
                return res.status(200).json({
                    errorEmail: true,
                    errorMessage: 'user does not exist'
                });
            } else {
                bcrypt.compare(req.body.password, result.password, (err, isPasswordCorrect) => {
                    if (err) {
                        return res.status(200).json({
                            error: true,
                            errorMessage: 'something went wrong while comparing the password'
                        });
                    } else if (!isPasswordCorrect) {
                        return res.status(200).json({
                            errorPassword: true,
                            errorMessage: 'wrong password'
                        });
                    } else {
                        const jwtPayload = {
                            id: result.id,
                            logged: true
                        }
                        let token = jwt.sign(jwtPayload, process.env.JWT_KEY, { expiresIn: '1h' });
                        if (result.userType === 'farmer') {
                            return res.status(200).json({
                                success: true,
                                successMessage: 'logged in',
                                token: token,
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
                                    message: 'successful',
                                    blogs,
                                    token
                                });
                            }).catch(err => {
                                return res.status(200).json({
                                    error: 'unsuccessful',
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
                errorMessage: err
            });
        });
    }
});

module.exports = router;