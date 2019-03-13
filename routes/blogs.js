const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const Shared = require('../model/shared');

router.get('/', (req, res) => {
    jwt.verify(req.query.token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                error: 'invalid token',
                tokenStatus: 'invalid'
            });
        } else {
            User.findById(decoded.id).then(result => {
                if (result) {
                    return res.status(200).json({
                        message: 'successfull',
                        blogs: result.blogs
                    });
                } else {
                    return res.status(200).json({
                        error: 'unsuccessful'
                    });
                }
            }).catch(err => {
                return res.status(200).json({
                    error: 'unsuccessful'
                });
            });
        }
    });
});

router.post('/', (req, res) => {
    jwt.verify(req.query.token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                error: 'invalid token',
                tokenStatus: 'invalid'
            });
        } else {
            User.findById(decoded.id).then(result => {
                if (result) {
                    User.findOneAndUpdate({
                        _id: decoded.id
                    }, {
                        $set: {
                            blogs: [...result.blogs, req.body.blogs]
                        }
                    }, {
                        rawResult: true
                    }).then(updatedResult => {
                        return res.status(200).json({
                            message: 'successful',
                            updatedBlogs: updatedResult.value.blogs,
                            updated: true
                        });
                    }).catch(err => {
                        return res.status(200).json({
                            error: 'unsuccessful while updating db',
                            errorMessage: err
                        });
                    });
                } else {
                    return res.status(200).json({
                        error: 'no result found'
                    });
                }
            }).catch(err => {
                return res.status(200).json({
                    error: 'unsuccessful while finding by id',
                    errorMessage: err
                });
            });
        }
    });
});

router.put('/', (req, res) => {
    jwt.verify(req.query.token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                error: 'invalid token',
                tokenStatus: 'invalid'
            });
        } else {
            User.findById(decoded.id).then(result => {
                let blogsArr = result.blogs;
                if (result) {
                    blogsArr = blogsArr.map(blog => {
                        if (blog.id === req.body.blogs.id) {
                            return {...blog, ...req.body.blogs }
                        } else {
                            return blog;
                        }
                    });
                    User.findOneAndUpdate({
                        _id: decoded.id
                    }, {
                        $set: {
                            blogs: blogsArr
                        }
                    }).then((updatedResult) => {
                        return res.status(200).json({
                            updated: true,
                            blogs: blogsArr
                        });
                    }).catch((err) => {
                        return res.status(200).json({
                            error: 'something went wrong while updating in db.',
                            errorMessage: err
                        });
                    });
                } else {
                    return res.status(200).json({
                        error: 'no result found'
                    });
                }
            }).catch(err => {
                return res.status(200).json({
                    error: 'unsuccessful while finding by id',
                    errorMessage: err
                });
            });
        }
    });
});

router.delete('/', (req, res) => {
    const jwtToken = req.query.token;
    jwt.verify(jwtToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                error: 'invalid token',
                errorMessage: 'unsuccessful',
                tokenStatus: 'invalid'
            });
        } else {
            User.findById(decoded.id).then(userResult => {
                if (!userResult) {
                    return res.status(200).json({
                        error: 'user not found',
                        errorMessage: 'unsuccessful'
                    });
                } else {
                    let blogsArr = userResult.blogs;
                    let deletedBlog = undefined;
                    blogsArr = blogsArr.filter(blog => {
                        if (blog.id === req.body.blogId) {
                            deletedBlog = blog;
                            return false;
                        } else {
                            return true;
                        }
                    });
                    if (deletedBlog) {
                        User.findOneAndUpdate({
                            _id: decoded.id
                        }, {
                            $set: {
                                blogs: blogsArr
                            }
                        }).then(deletedResult => {
                            if (deletedResult) {
                                if (deletedBlog.shared) {
                                    Shared.findOneAndRemove({ blogId: req.body.blogId }).then(deletedShared => {
                                        if (deletedShared) {
                                            return res.status(200).json({
                                                message: 'successful'
                                            });
                                        }
                                    }).catch(err => {
                                        return res.status(200).json({
                                            error: 'something went wrong',
                                            errorMessage: err
                                        });
                                    });
                                } else {
                                    return res.status(200).json({
                                        message: 'successful'
                                    });
                                }
                            }
                        }).catch(err => {
                            return res.status(200).json({
                                error: 'something went wrong',
                                errorMessage: err
                            });
                        });
                    }
                }
            }).catch(err => {
                return res.status(200).json({
                    error: 'something went wrong',
                    errorMessage: err
                });
            });
        }
    });
});

module.exports = router;