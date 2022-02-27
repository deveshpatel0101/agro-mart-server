const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const User = require('../model/user');
const { registerSchema } = require('../validators/register');

router.post('/', async (req, res) => {
	let userObj = {
		...req.body,
		items: [],
	};

	const result = Joi.validate(userObj, registerSchema);
	if (result.error) {
		if (result.error.details[0].path[0] === 'password') {
			return res.status(400).json({
				error: true,
				errorType: result.error.details[0].path[0],
				errorMessage:
					'Password is required and should be at least 6 characters long and should include at least one uppercase letter and a numeric character.',
			});
		} else if (result.error.details[0].path[0] === 'confirmPassword') {
			return res.status(400).json({
				error: true,
				errorType: result.error.details[0].path[0],
				errorMessage: 'Both passwords should match.',
			});
		}
		return res.status(400).json({
			error: true,
			errorType: result.error.details[0].path[0],
			errorMessage: result.error.details[0].message,
		});
	}

	const user = await User.findOne({ email: userObj.email });

	if (user) {
		return res.status(400).json({
			error: true,
			errorType: 'email',
			errorMessage: 'User already exist.',
		});
	}

	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(userObj.password, salt);
	userObj.password = hash;

	await new User(userObj).save();
	res.status(200).json({
		error: false,
		successMessage: 'User created successfully. You can now login.',
	});
});

module.exports = router;
