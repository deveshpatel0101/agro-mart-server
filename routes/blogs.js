const router = require('express').Router();
const Joi = require('joi');
const uuid = require('uuid/v4');

const User = require('../model/user');
const Shared = require('../model/shared');
const auth = require('../middleware/auth');
const { createBlogSchema, deleteBlogSchema, updateBlogSchema } = require('../validators/blogs');

// returns an array of complete blogs
router.get('/', auth, (req, res) => {
  User.findById(req.user.id)
    .then((result) => {
      if (result) {
        return res.status(200).json({
          error: false,
          blogs: result.blogs,
        });
      } else {
        return res.status(400).json({
          error: true,
          errorType: 'user',
          errorMessage: 'Unable to find the user from database.',
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

// add a new blog to the blogs array
router.post('/', auth, (req, res) => {
  const obj = {
    ...req.body,
    blogId: uuid(),
    shared: false,
  };

  const result = Joi.validate(obj, createBlogSchema);
  if (result.error) {
    return res.status(400).json({
      error: true,
      errorType: result.error.details[0].path[0],
      errorMessage: result.error.details[0].message,
    });
  }

  obj.createdAt = new Date(result.value.createdAt).getTime();
  obj.lastModified = new Date(result.value.lastModified).getTime();

  User.findById(req.user.id)
    .then((result) => {
      if (result) {
        User.findOneAndUpdate(
          {
            _id: req.user.id,
          },
          {
            $push: {
              blogs: obj,
            },
          },
          {
            new: true,
          },
        )
          .then((updatedResult) => {
            return res.status(200).json({
              error: false,
              updated: true,
              blogId: obj.blogId,
              blogs: updatedResult.blogs,
              addedBlog: obj,
            });
          })
          .catch((err) => {
            return res.status(500).json({
              error: true,
              errorType: 'unexpected',
              errorMessage: err,
            });
          });
      } else {
        return res.status(400).json({
          error: true,
          errorType: 'user',
          errorMessage: 'Unable to find the user in database.',
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

// updates a blog specified by blog object. id is necessary.
router.put('/', auth, (req, res) => {
  const obj = {
    ...req.body,
  };

  const validate = Joi.validate(obj, updateBlogSchema);
  if (validate.error) {
    return res.status(400).json({
      error: true,
      errorType: validate.error.details[0].path[0],
      errorMessage: validate.error.details[0].message,
    });
  }
  const { createdAt, lastModified } = validate.value.values;

  if (createdAt) {
    obj.values.createdAt = new Date(createdAt).getTime();
  }
  if (lastModified) {
    obj.values.lastModified = new Date(lastModified).getTime();
  }
  User.findById(req.user.id)
    .then((result) => {
      let blogsArr = result.blogs;
      let updatedBlog = undefined;
      if (result) {
        blogsArr = blogsArr.map((blog) => {
          if (blog.blogId === obj.blogId) {
            updatedBlog = { ...blog, ...obj.values };
            return { ...blog, ...obj.values };
          } else {
            return blog;
          }
        });
        Promise.all([
          User.findOneAndUpdate(
            {
              _id: req.user.id,
            },
            {
              $set: {
                blogs: blogsArr,
              },
            },
            {
              new: true,
            },
          ),
          updatedBlog
            ? Shared.findOneAndUpdate(
                {
                  blogId: req.body.blogId,
                },
                {
                  $set: {
                    ...updatedBlog,
                  },
                },
              )
            : null,
        ])
          .then((values) => {
            return res.status(200).json({
              error: false,
              updated: true,
              blogId: updatedBlog.blogId,
              blogs: values[0].blogs,
              updatedBlog,
            });
          })
          .catch((err) => {
            return res.status(500).json({
              error: true,
              errorType: 'unexpected',
              errorMessage: err,
            });
          });
      } else {
        return res.status(400).json({
          error: true,
          errorType: 'user',
          errorMessage: 'Unable to find the user in database.',
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
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
      errorMessage: result.error.details[0].message,
    });
  }
  User.findById(req.user.id)
    .then((userResult) => {
      if (!userResult) {
        return res.status(400).json({
          error: true,
          errorType: 'user',
          errorMessage: 'Unable to find the user in database.',
        });
      } else {
        let blogsArr = userResult.blogs;
        let deletedBlog = undefined;
        blogsArr = blogsArr.filter((blog) => {
          if (blog.blogId === req.body.blogId) {
            deletedBlog = blog;
            return false;
          } else {
            return true;
          }
        });
        if (deletedBlog) {
          Promise.all([
            User.findOneAndUpdate(
              {
                _id: req.user.id,
              },
              {
                $set: {
                  blogs: blogsArr,
                },
              },
              {
                new: true,
              },
            ),
            deletedBlog.shared ? Shared.findOneAndRemove({ blogId: req.body.blogId }) : null,
          ])
            .then((values) => {
              return res.status(200).json({
                error: false,
                blogs: values[0].blogs,
                deletedBlog,
              });
            })
            .catch((err) => {
              return res.status(500).json({
                error: true,
                errorType: 'unexpected',
                errorMessage: err,
              });
            });
        } else {
          return res.status(400).json({
            error: true,
            errorType: 'blogId',
            errorMessage: 'Specified item not found.',
          });
        }
      }
    })
    .catch((err) => {
      return res.status(500).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

module.exports = router;
