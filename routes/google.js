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
            errorMessage: 'not a valid username'
        });
    } else if (!validator.isEmail(googleUser.email)) {
        return res.status(200).json({
            error: true,
            errorMessage: 'not a valid email'
        });
    } else if (!googleUser.profileImage && !googleUser.profileImage.trim().length > 0) {
        return res.status(200).json({
            error: true,
            errorMessage: 'not a valid profile image link'
        });
    } else if (!googleUser.googleId && !googleUser.googleId.trim().length > 0) {
        return res.status(200).json({
            error: true,
            errorMessage: 'not a valid google id'
        });
    } else if (!googleUser.accessToken && !googleUser.accessToken.trim().length > 0) {
        return res.status(200).json({
            error: true,
            errorMessage: 'not a valid access token'
        });
    } else {
        User.findOne({ email: googleUser.email }).then(result => {
            if (!result) {
                if (!googleUser.userType) {
                    return res.status(200).json({
                        errorUserType: true,
                        errorMessage: 'not a valid user type'
                    });
                } else if (!googleUser.position || !googleUser.position.latitude || !googleUser.position.longitude) {
                    return res.status(200).json({
                        errorPosition: true,
                        errorMessage: 'user location is required for new user'
                    });
                } else {
                    new User(googleUser).save().then(savedResult => {
                        if (!savedResult) {
                            return res.status(200).json({
                                error: true,
                                errorMessage: 'something went wrong while saving user info in our database'
                            });
                        } else {
                            const jwtToken = generateJwt(savedResult.id);
                            return res.status(200).json({
                                success: true,
                                successMessage: 'user created',
                                jwtToken: jwtToken,
                                blogs: []
                            });
                        }
                    }).catch(error => {
                        return res.status(200).json({
                            error: true,
                            errorMessage: error.message
                        });
                    });
                }
            } else {
                const jwtToken = generateJwt(result.id);
                if (result.userType === 'farmer') {
                    return res.status(200).json({
                        success: true,
                        successMessage: 'user already exists',
                        jwtToken: jwtToken,
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
                            jwtToken
                        });
                    }).catch(err => {
                        return res.status(200).json({
                            error: 'unsuccessful',
                            errorMessage: err
                        });
                    });
                }
            }
        }).catch(error => {
            return res.status(200).json({
                error: true,
                errorMessage: error.message
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