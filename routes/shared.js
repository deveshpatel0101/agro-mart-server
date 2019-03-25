const router = require('express').Router();
const Joi = require('joi');

const Shared = require('../model/shared');
const User = require('../model/user');
const auth = require('../middleware/auth');
const { sharedSchema } = require('../validators/shared');

router.get('/', (req, res) => {
  const q = req.query.q;
  const page = req.query.page ? parseInt(req.query.page) - 1: 0;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 50;
  console.log(q, page, per_page);
  if (per_page && per_page > 100) {
    return res.status(200).json({
      error: true,
      errorType: 'per_page',
      errorMessage: 'Per page of maximum 100 is allowed',
    });
  }
  const query = {
    $or: [
      { title: new RegExp(q, "gi") },
      { description: new RegExp(q, "gi") },
    ],
  };
  Shared.find(q ? query : null)
    .skip(q ? 0 : page * per_page)
    .limit(per_page)
    .then((result) => {
      return res.status(200).json({
        error: false,
        blogs: result,
      });
    })
    .catch((err) => {
      return res.status(200).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

router.put('/', auth, (req, res) => {
  const result = Joi.validate(req.body, sharedSchema);
  if (result.error) {
    return res.status(200).json({
      error: true,
      errorType: result.error.details[0].path[0],
      errorMessage: result.error.details[0].message,
    });
  }
  User.findById(req.user.id)
    .then((userResult) => {
      if (userResult) {
        // doNothing flag is used to know whether the actual shared value of db and shared value from request conflicts. if so then only update the db.
        let doNothing = false,
          sharedBlog;
        let finalBlogsArr = userResult.blogs.map((blog) => {
          if (blog.blogId === req.body.blogId) {
            if (blog.shared === req.body.values.shared) {
              doNothing = true;
            }
            if (req.body.values.shared) {
              sharedBlog = {
                ...blog,
                position: { ...userResult.position },
                shared: req.body.values.shared,
              };
            }
            return { ...blog, shared: req.body.values.shared };
          }
          return blog;
        });
        if (!doNothing) {
          Promise.all([
            User.findOneAndUpdate(
              { _id: req.user.id },
              {
                $set: {
                  blogs: finalBlogsArr,
                },
              },
              {
                new: true,
              },
            ),
            req.body.values.shared
              ? new Shared({ ...sharedBlog }).save()
              : Shared.findOneAndDelete({ blogId: req.body.blogId }),
          ])
            .then((values) => {
              return res.status(200).json({
                error: false,
                message: 'Updated successfully.',
                blogId: req.body.blogId,
                blogs: values[0].blogs,
                sharedBlog,
              });
            })
            .catch((err) => {
              return res.status(200).json({
                error: true,
                errorType: 'unexpected',
                errorMessage: err,
              });
            });
        } else {
          return res.status(200).json({
            error: false,
            message: 'No updates required',
            blogId: req.body.blogId,
            blogs: userResult.blogs,
            sharedBlog,
          });
        }
      } else {
        return res.status(200).json({
          error: true,
          errorType: 'user',
          errorMessage: 'Unable to find the user from database.',
        });
      }
    })
    .catch((err) => {
      return res.status(200).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

router.get('/blog', (req, res) => {
  if (req.query.blogId) {
    Shared.findOne({ blogId: req.query.blogId }).then((result) => {
      if (result) {
        return res.status(200).json({
          error: false,
          blog: result,
        });
      } else {
        return res.status(200).json({
          error: true,
          errorType: 'blogId',
          errorMessage: 'Specified item does not exist.',
        });
      }
    });
  } else {
    return res.status(200).json({
      error: true,
      errorType: 'blogId',
      errorMessage: 'Id is required in query parameter.',
    });
  }
});

module.exports = router;
