const router = require('express').Router();
const Joi = require('joi');
const uuid = require('uuid/v4');

const User = require('../model/user');
const Shared = require('../model/shared');
const auth = require('../middleware/auth');
const { createItemSchema, deleteItemSchema, updateItemSchema } = require('../validators/items');

// returns an array of complete items
router.get('/', auth, (req, res) => {
  User.findById(req.user.id)
    .then((result) => {
      if (result) {
        return res.status(200).json({
          error: false,
          items: result.items,
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

// add a new item to the items array
router.post('/', auth, (req, res) => {
  const obj = {
    ...req.body,
    itemId: uuid(),
    shared: false,
  };

  const result = Joi.validate(obj, createItemSchema);
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
              items: obj,
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
              itemId: obj.itemId,
              items: updatedResult.items,
              addedItem: obj,
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

// updates a item specified by item object. id is necessary.
router.put('/', auth, (req, res) => {
  const obj = {
    ...req.body,
  };

  const validate = Joi.validate(obj, updateItemSchema);
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
      let itemsArr = result.items;
      let updatedItem = undefined;
      if (result) {
        itemsArr = itemsArr.map((item) => {
          if (item.itemId === obj.itemId) {
            updatedItem = { ...item, ...obj.values };
            return { ...item, ...obj.values };
          } else {
            return item;
          }
        });
        Promise.all([
          User.findOneAndUpdate(
            {
              _id: req.user.id,
            },
            {
              $set: {
                items: itemsArr,
              },
            },
            {
              new: true,
            },
          ),
          updatedItem
            ? Shared.findOneAndUpdate(
                {
                  itemId: req.body.itemId,
                },
                {
                  $set: {
                    ...updatedItem,
                  },
                },
              )
            : null,
        ])
          .then((values) => {
            return res.status(200).json({
              error: false,
              updated: true,
              itemId: updatedItem.itemId,
              items: values[0].items,
              updatedItem,
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

// deletes a specific item specified by itemId in request body
router.delete('/', auth, (req, res) => {
  const result = Joi.validate(req.body, deleteItemSchema);
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
        let itemsArr = userResult.items;
        let deletedItem = undefined;
        itemsArr = itemsArr.filter((item) => {
          if (item.itemId === req.body.itemId) {
            deletedItem = item;
            return false;
          } else {
            return true;
          }
        });
        if (deletedItem) {
          Promise.all([
            User.findOneAndUpdate(
              {
                _id: req.user.id,
              },
              {
                $set: {
                  items: itemsArr,
                },
              },
              {
                new: true,
              },
            ),
            deletedItem.shared ? Shared.findOneAndRemove({ itemId: req.body.itemId }) : null,
          ])
            .then((values) => {
              return res.status(200).json({
                error: false,
                items: values[0].items,
                deletedItem,
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
            errorType: 'itemId',
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
