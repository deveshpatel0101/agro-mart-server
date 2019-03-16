const router = require('express').Router();

const Shared = require('../model/shared');
const User = require('../model/user');
const auth = require('../middleware/auth');

router.post('/shared', auth, (req, res) => {
    // TODO: make sure to use efficient method of updating item from array in mongodb. Return updated item in response.
    User.findById(req.user.id).then(userResult => {
        if (userResult) {
            let finalBlogsArr = userResult.blogs.map(blog => blog.id === req.body.blogId ? {...blog, shared: req.body.shared } : blog);
            User.findOneAndUpdate({ _id: req.user.id }, {
                $set: {
                    blogs: finalBlogsArr
                }
            }).then(finalResult => {
                if (finalResult) {
                    if (!req.body.shared) {
                        Shared.findOneAndRemove({ blogId: req.body.blogId }).then(deleteBlogResult => {
                            if (deleteBlogResult) {
                                return res.status(200).json({
                                    error: false,
                                    message: 'successful delete',
                                    result: deleteBlogResult
                                });
                            }
                        }).catch(err => {
                            console.log(err);
                            return res.status(200).json({
                                error: true,
                                errorType: 'unexpected',
                                errorMessage: err
                            });
                        });
                    } else {
                        let sharedBlog = new Shared({...req.body, position: userResult.position });
                        sharedBlog.save().then(sharedResult => {
                            if (sharedResult) {
                                return res.status(200).json({
                                    error: false,
                                    message: 'successful',
                                    result: sharedResult
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
                    return res.status(200).json({
                        error: true,
                        errorType: 'id',
                        error: 'Unable to find the user from database.'
                    });
                }
            });
        } else {
            return res.status(200).json({
                error: true,
                errorType: 'id',
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

router.get('/shared/blog', auth, (req, res) => {
    if (req.query.id) {
        // TODO: make sure to use efficient method of updating item in mongodb. Return updated item in response.
        Shared.findOne({ blogId: req.query.id }).then(result => {
            if (result) {
                return res.status(200).json({
                    error: false,
                    message: 'successful',
                    blog: result
                });
            } else {
                return res.status(200).json({
                    error: true,
                    errorType: 'blog',
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