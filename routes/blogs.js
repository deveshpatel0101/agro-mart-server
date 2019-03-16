const router = require('express').Router();
const geolib = require('geolib');

const User = require('../model/user');
const Shared = require('../model/shared');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
    User.findById(req.user.id).then(result => {
        if (result) {
            if (result.userType === 'farmer') {
                return res.status(200).json({
                    error: false,
                    blogs: result.blogs
                });
            } else if (result.userType === 'customer') {
                const currPosition = result.position;
                let blogs = [];
                Shared.find().limit(20).then(resultShared => {
                    for (let i = 0; i < resultShared.length; i++) {
                        const distance = geolib.getDistance(currPosition, resultShared[i].position);
                        if (distance < 6000) {
                            blogs.push(resultShared[i]);
                        }
                    }
                    return res.status(200).json({
                        error: false,
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

router.post('/', auth, (req, res) => {
    User.findById(req.user.id).then(result => {
        // TODO: make sure to use the efficient method of updating arrays in mongodb and return the updated array in response.
        if (result) {
            User.findOneAndUpdate({
                _id: req.user.id
            }, {
                $set: {
                    blogs: [...result.blogs, req.body.blogs]
                }
            }, {
                rawResult: true
            }).then(updatedResult => {
                return res.status(200).json({
                    error: false,
                    updatedBlogs: updatedResult.value.blogs,
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
                error: true,
                errorType: 'id',
                errorMessage: 'Unable to find the user in database.'
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

router.put('/', auth, (req, res) => {
    User.findById(req.user.id).then(result => {
        // TODO: make sure to use efficient method of updating item of array in mongodb. Return the update item in response.
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
                _id: req.user.id
            }, {
                $set: {
                    blogs: blogsArr
                }
            }).then((updatedResult) => {
                return res.status(200).json({
                    error: false,
                    updated: true,
                    blogs: blogsArr
                });
            }).catch((err) => {
                return res.status(200).json({
                    error: true,
                    errorType: 'unexpected',
                    errorMessage: err
                });
            });
        } else {
            return res.status(200).json({
                error: true,
                errorType: 'id',
                errorMessage: 'Unable to find the user in database.'
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

router.delete('/', auth, (req, res) => {
    User.findById(req.user.id).then(userResult => {
        // TODO: make sure to use efficient method of deleting an item from array in mongodb. Return the deleted item in response.
        if (!userResult) {
            return res.status(200).json({
                error: true,
                errorType: 'id',
                errorMessage: 'Unable to find the user in database.'
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
                    _id: req.user.id
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
                                        error: false
                                    });
                                }
                            }).catch(err => {
                                return res.status(200).json({
                                    error: true,
                                    errorType: 'unexpected',
                                    errorMessage: err
                                });
                            });
                        } else {
                            return res.status(200).json({
                                error: false
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