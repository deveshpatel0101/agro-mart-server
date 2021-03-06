const router = require('express').Router();
const Joi = require('joi');

const Shared = require('../model/shared');
const User = require('../model/user');
const auth = require('../middleware/auth');
const { sharedSchema, getSharedItemsSchema } = require('../validators/shared');

router.get('/', (req, res) => {
  const result = Joi.validate(
    { q: req.query.q, page: req.query.page, per_page: req.query.per_page },
    getSharedItemsSchema,
  );

  if (result.error) {
    return res.status(400).json({
      error: true,
      errorType: result.error.details[0].path[0],
      errorMessage: result.error.details[0].message,
    });
  }

  const q = req.query.q;
  const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 50;

  const query = {
    $or: [{ title: new RegExp(q, 'gi') }, { description: new RegExp(q, 'gi') }],
  };

  Shared.find(q ? query : null)
    .skip(q ? 0 : page * per_page)
    .limit(per_page)
    .then((result) => {
      return res.status(200).json({
        error: false,
        items: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: true,
        errorType: 'unexpected',
        errorMessage: err,
      });
    });
});

router.put('/', auth, (req, res) => {
  const result = Joi.validate(req.body, sharedSchema);
  if (result.error) {
    return res.status(400).json({
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
          sharedItem;
        let finalItemsArr = userResult.items.map((item) => {
          if (item.itemId === req.body.itemId) {
            if (item.shared === req.body.values.shared) {
              doNothing = true;
            }
            if (req.body.values.shared) {
              sharedItem = {
                ...item,
                position: { ...userResult.position },
                shared: req.body.values.shared,
              };
            }
            return { ...item, shared: req.body.values.shared };
          }
          return item;
        });
        if (!doNothing) {
          Promise.all([
            User.findOneAndUpdate(
              { _id: req.user.id },
              {
                $set: {
                  items: finalItemsArr,
                },
              },
              {
                new: true,
              },
            ),
            req.body.values.shared
              ? new Shared({ ...sharedItem }).save()
              : Shared.findOneAndDelete({ itemId: req.body.itemId }),
          ])
            .then((values) => {
              return res.status(200).json({
                error: false,
                message: 'Updated successfully.',
                itemId: req.body.itemId,
                items: values[0].items,
                sharedItem,
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
          return res.status(200).json({
            error: false,
            message: 'No updates required',
            itemId: req.body.itemId,
            items: userResult.items,
            sharedItem,
          });
        }
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

router.get('/item', (req, res) => {
  if (req.query.itemId) {
    Shared.findOne({ itemId: req.query.itemId }).then((result) => {
      if (result) {
        User.findOne({ items: { $elemMatch: { itemId: req.query.itemId } } }).then((userResult) => {
          if (userResult) {
            return res.status(200).json({
              error: false,
              item: result,
              user: {
                username: userResult.username,
                email: userResult.email,
                position: userResult.position,
              },
            });
          } else {
            return res.status(400).json({
              error: true,
              errorType: 'itemId',
              errorMessage: 'Specified item does not belong to any user.',
            });
          }
        });
      } else {
        return res.status(400).json({
          error: true,
          errorType: 'itemId',
          errorMessage: 'Specified item does not exist.',
        });
      }
    });
  } else {
    return res.status(400).json({
      error: true,
      errorType: 'itemId',
      errorMessage: 'Id is required in query parameter.',
    });
  }
});

module.exports = router;
