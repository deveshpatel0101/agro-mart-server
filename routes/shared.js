const router = require('express').Router();
const Joi = require('joi');

const Shared = require('../model/shared');
const User = require('../model/user');
const auth = require('../middleware/auth');
const { sharedSchema } = require('../validators/shared');

router.put('/', auth, (req, res) => {
    const result = Joi.validate(req.body, sharedSchema);
    if (result.error) {
        return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            errorMessage: result.error.details[0].message
        });
    }
    User.findById(req.user.id).then(userResult => {
        if (userResult) {
            // doNothing flag is used to know whether the actual shared value of db and shared value from request conflicts. if so then only update the db.
            let doNothing = false;
            let finalBlogsArr = userResult.blogs.map(blog => {
                if (blog.blogId === req.body.blogId) {
                    if (blog.shared === req.body.values.shared) {
                        doNothing = true;
                    }
                    return {...blog, shared: req.body.values.shared }
                }
                return blog
            });
            let blog;
            if (req.body.values.shared && !doNothing) {
                blog = userResult.blogs.find(blog => blog.blogId === req.body.blogId);
                if (blog) {
                    blog = {...blog, position: {...userResult.position }, shared: req.body.values.shared }
                }
                if(!blog) {
                    doNothing = true;
                }
            }
            if (!doNothing) {
                Promise.all([
                    User.findOneAndUpdate({ _id: req.user.id }, {
                        $set: {
                            blogs: finalBlogsArr
                        }
                    }, {
                        new: true
                    }),
                    req.body.values.shared ? new Shared({...blog }).save() : Shared.findOneAndDelete({ blogId: req.body.blogId })
                ]).then(values => {
                    return res.status(200).json({
                        error: false,
                        message: 'Updated successfully.',
                        result: values[0].blogs
                    });
                }).catch(err => {
                    return res.status(200).json({
                        error: true,
                        errorType: 'unexpected',
                        errorMessage: err
                    });
                });
            } else {
                return res.status(200).json({
                    error: false,
                    message: 'Updated successfully.',
                    result: userResult.blogs
                });
            }
        } else {
            return res.status(200).json({
                error: true,
                errorType: 'blogId',
                errorMessage: 'Unable to find the user from database.'
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

router.get('/blog', (req, res) => {
    if (req.query.blogId) {
        Shared.findOne({ blogId: req.query.blogId }).then(result => {
            if (result) {
                return res.status(200).json({
                    error: false,
                    blog: result
                });
            } else {
                return res.status(200).json({
                    error: true,
                    errorType: 'blogId',
                    errorMessage: 'Specified item does not exist.'
                });
            }
        });
    } else {
        return res.status(200).json({
            error: false,
            errorType: 'blogId',
            errorMessage: 'Id is required in query parameter.'
        });
    }
});

module.exports = router;