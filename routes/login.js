const router = require('express').Router();
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

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
                        return res.status(200).json({
                            success: true,
                            successMessage: 'logged in',
                            token: token,
                            blogs: result.blogs
                        });
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