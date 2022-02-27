const router = require('express').Router();
const Joi = require('joi');

const Shared = require('../model/shared');
const User = require('../model/user');
const auth = require('../middleware/auth');
const { sharedSchema, getSharedItemsSchema } = require('../validators/shared');

router.get('/', async (req, res) => {
	const result = Joi.validate(
		{ q: req.query.q, page: req.query.page, per_page: req.query.per_page },
		getSharedItemsSchema
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

	const items = await Shared.find(q ? query : null)
		.skip(q ? 0 : page * per_page)
		.limit(per_page);

	return res.status(200).json({
		error: false,
		items,
	});
});

router.put('/', auth, async (req, res) => {
	const result = Joi.validate(req.body, sharedSchema);
	if (result.error) {
		return res.status(400).json({
			error: true,
			errorType: result.error.details[0].path[0],
			errorMessage: result.error.details[0].message,
		});
	}
	const user = await User.findById(req.user.id);
	if (!user) {
		return res.status(400).json({
			error: true,
			errorType: 'user',
			errorMessage: 'Unable to find the user from database.',
		});
	}

	// doNothing flag is used to know whether the actual shared value of db and shared value from request conflicts. if so then only update the db.
	let doNothing = false,
		sharedItem;
	let finalItemsArr = user.items.map((item) => {
		if (item.itemId === req.body.itemId) {
			if (item.shared === req.body.values.shared) {
				doNothing = true;
			}
			if (req.body.values.shared) {
				sharedItem = {
					...item,
					position: { ...user.position },
					shared: req.body.values.shared,
				};
			}
			return { ...item, shared: req.body.values.shared };
		}
		return item;
	});
	if (doNothing) {
		return res.status(200).json({
			error: false,
			message: 'No updates required',
			itemId: req.body.itemId,
			items: user.items,
			sharedItem,
		});
	}

	const values = await Promise.all([
		User.findOneAndUpdate(
			{ _id: req.user.id },
			{
				$set: {
					items: finalItemsArr,
				},
			},
			{
				new: true,
			}
		),
		req.body.values.shared
			? new Shared({ ...sharedItem }).save()
			: Shared.findOneAndDelete({ itemId: req.body.itemId }),
	]);

	return res.status(200).json({
		error: false,
		message: 'Updated successfully.',
		itemId: req.body.itemId,
		items: values[0].items,
		sharedItem,
	});
});

router.get('/item', async (req, res) => {
	if (!req.query.itemId) {
		return res.status(400).json({
			error: true,
			errorType: 'itemId',
			errorMessage: 'Id is required in query parameter.',
		});
	}
	const result = await Shared.findOne({ itemId: req.query.itemId });
	if (!result) {
		return res.status(400).json({
			error: true,
			errorType: 'itemId',
			errorMessage: 'Specified item does not exist.',
		});
	}

	const user = await User.findOne({
		items: { $elemMatch: { itemId: req.query.itemId } },
	});
	if (!user) {
		return res.status(400).json({
			error: true,
			errorType: 'itemId',
			errorMessage: 'Specified item does not belong to any user.',
		});
	}

	return res.status(200).json({
		error: false,
		item: result,
		user: {
			username: user.username,
			email: user.email,
			position: user.position,
		},
	});
});

module.exports = router;
