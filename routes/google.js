const router = require("express").Router();
const jwt = require('jsonwebtoken');
const validator = require('validator');
const geolib = require('geolib');

const User = require('../model/user');
const Shared = require('../model/shared');

router.post('/', (req, res) => {
    let googleUser = {
        username: req.body.username,
        email: req.body.email,
        profileImage: req.body.profileImage,
        accountType: 'google',
        googleId: req.body.googleId,
        accessToken: req.body.accessToken,
        position: req.body.position,
        userType: req.body.userType
    }
    if (googleUser.username && googleUser.username.trim().length < 3) {
        return res.status(200).json({
            error: true,
            errorType: 'username',
            errorMessage: 'Not a valid username. It must of at least 3 characters long.'
        });
    } else if (!validator.isEmail(googleUser.email)) {
        return res.status(200).json({
            error: true,
            errorType: 'email',
            errorMessage: 'Not a valid email.'
        });
    } else if (!googleUser.profileImage && !googleUser.profileImage.trim().length > 0) {
        return res.status(200).json({
            error: true,
            errorType: 'profileImage',
            errorMessage: 'Not a valid profile image link.'
        });
    } else if (!googleUser.googleId && !googleUser.googleId.trim().length > 0) {
        return res.status(200).json({
            error: true,
            errorType: 'googleId',
            errorMessage: 'Not a valid google ID.'
        });
    } else if (!googleUser.accessToken && !googleUser.accessToken.trim().length > 0) {
        return res.status(200).json({
            error: true,
            errorType: 'accessToken',
            errorMessage: 'Not a valid access token.'
        });
    } else {
        User.findOne({ email: googleUser.email }).then(result => {
            if (!result) {
                if (!googleUser.userType || (googleUser.userType !== 'farmer' && googleUser.userType !== 'customer')) { // validate user type must a farmer of customer only
                    return res.status(200).json({
                        error: true,
                        errorType: 'userType',
                        errorMessage: 'Not a valid user type. It must either a farmer or customer.'
                    });
                } else if (!googleUser.position || !googleUser.position.latitude || !googleUser.position.longitude) {
                    return res.status(200).json({
                        error: true,
                        errorType: 'position',
                        errorMessage: 'Not a valid position. It must include latitude and longitude parameters.'
                    });
                } else {
                    new User(googleUser).save().then(savedResult => {
                        const jwtToken = generateJwt(savedResult.id);
                        if (savedResult.userType === 'farmer') {
                            return res.status(200).json({
                                error: false,
                                jwtToken,
                                blogs: []
                            });
                        } else if (savedResult.userType === 'customer') {
                            const currPosition = savedResult.position;
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
                    }).catch(err => {
                        return res.status(200).json({
                            error: true,
                            errorType: 'unexpected',
                            errorMessage: err
                        });
                    });
                }
            } else {
                const jwtToken = generateJwt(result.id);
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
        }).catch(err => {
            return res.status(200).json({
                error: true,
                errorType: 'unexpected',
                errorMessage: err
            });
        });
    }
});

function generateJwt(id) {
    let newUser = {
        id: id,
        loggedIn: true
    }
    let jwtToken = jwt.sign(newUser, process.env.JWT_KEY, { expiresIn: '1h' })
    return jwtToken;
}

module.exports = router;