const router = require('express').Router();

const Shared = require('../model/shared');
const User = require('../model/user');
const auth = require('../middleware/auth');

router.post('/shared', auth, (req, res) => {
    User.findById(req.user.id).then(userResult => {
        if (userResult) {
            // doNothing flag is used to know whether the actual shared value of db and shared value from request conflicts. if so then only update the db.
            let doNothing = false;
            let finalBlogsArr = userResult.blogs.map(blog => {
                if (blog.id === req.body.blogId) {
                    if (blog.shared === req.body.shared) {
                        doNothing = true;
                    }
                    return {...blog, shared: req.body.shared }
                }
                return blog
            });
            let blog;
            if (req.body.shared) {
                blog = userResult.blogs.find(blog => blog.id === req.body.blogId);
                blog = {...blog, blogId: blog.id, position: {...userResult.position }, shared: req.body.shared }
                delete blog.id;
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
                    req.body.shared ? new Shared({...blog }).save() : Shared.findOneAndDelete({ blogId: req.body.blogId })
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