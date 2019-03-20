const router = require('express').Router();
const geolib = require('geolib');
const Joi = require('joi');

const User = require('../model/user');
const Shared = require('../model/shared');
const auth = require('../middleware/auth');
const { createBlogSchema, deleteBlogSchema, updateBlogSchema } = require('../validators/blogs');

// returns an array of complete blogs
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

// add a new blog to the blogs array
router.post('/', auth, (req, res) => {
    // TODO: give blog id using uuid here and return the blog.
    const obj = { id: req.body.blogId, ...req.body, shared: false };
    delete obj.blogId;
    const result = Joi.validate(obj, createBlogSchema);
    if (result.error) {
        return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            errorMessage: result.error.details[0].message
        });
    }
    User.findById(req.user.id).then(result => {
        if (result) {
            User.findOneAndUpdate({
                _id: req.user.id
            }, {
                $push: {
                    blogs: obj
                }
            }, {
                new: true
            }).then(updatedResult => {
                return res.status(200).json({
                    error: false,
                    updated: true,
                    blogs: updatedResult.blogs,
                    addedBlog: obj
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

// updates a blog specified by blog object. id is necessary.
router.put('/', auth, (req, res) => {
    // TODO: do not allow to update id of blog. change architecture if necessary.
    const result = Joi.validate(req.body, updateBlogSchema);
    if (result.error) {
        return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            errorMessage: result.error.details[0].message
        });
    }
    User.findById(req.user.id).then(result => {
        let blogsArr = result.blogs;
        let actualBlog = undefined,
            updatedBlog = undefined;
        if (result) {
            blogsArr = blogsArr.map(blog => {
                if (blog.id === req.body.blogId) {
                    actualBlog = blog;
                    updatedBlog = {...blog, ...req.body.values };
                    return {...blog, ...req.body.values }
                } else {
                    return blog;
                }
            });
            Promise.all([
                User.findOneAndUpdate({
                    _id: req.user.id
                }, {
                    $set: {
                        blogs: blogsArr
                    }
                }, {
                    new: true
                }),
                actualBlog && actualBlog.shared ? Shared.findOneAndUpdate({
                    blogId: req.body.blogs.id
                }, {
                    $set: {...req.body.blogs }
                }) : null
            ]).then(values => {
                return res.status(200).json({
                    error: false,
                    updated: true,
                    blogs: values[0].blogs,
                    updatedBlog
                });
            }).catch(err => {
                return res.status(200).json({
                    error: true,
                    errorType: 'unexpected',
                    errorMessage: err
                });
            })
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

// deletes a specific blog specified by blogId in request body
router.delete('/', auth, (req, res) => {
    const result = Joi.validate(req.body, deleteBlogSchema);
    if (result.error) {
        return res.status(200).json({
            error: true,
            errorType: result.error.details[0].path[0],
            errorMessage: result.error.details[0].message
        });
    }
    User.findById(req.user.id).then(userResult => {
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
                Promise.all([
                    User.findOneAndUpdate({
                        _id: req.user.id
                    }, {
                        $set: {
                            blogs: blogsArr
                        }
                    }, {
                        new: true
                    }),
                    deletedBlog.shared ? Shared.findOneAndRemove({ blogId: req.body.blogId }) : null
                ]).then(values => {
                    return res.status(200).json({
                        error: false,
                        blogs: values[0].blogs,
                        deletedBlog
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
                    errorType: 'blog',
                    errorMessage: 'Specified item not found.'
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