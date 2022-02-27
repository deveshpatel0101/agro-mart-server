const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('config');

const User = require('../model/user');
const { loginSchema } = require('../validators/login');

router.post('/', async (req, res) => {
	const result = Joi.validate(req.body, loginSchema);
	if (result.error) {
		if (result.error.details[0].path[0] === 'password') {
			return res.status(403).json({
				error: true,
				errorType: result.error.details[0].path[0],
				errorMessage:
					'Password is required and should be at least 6 characters long and should include at least one uppercase letter and a numeric character.',
			});
		}

		return res.status(403).json({
			error: true,
			errorType: result.error.details[0].path[0],
			errorMessage: result.error.details[0].message,
		});
	}
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return res.status(400).json({
			error: true,
			errorType: 'email',
			errorMessage: 'User does not exist.',
		});
	}

	const isValid = bcrypt.compareSync(req.body.password, user.password);
	if (!isValid) {
		return res.status(400).json({
			error: true,
			errorType: 'password',
			errorMessage: 'Wrong password.',
		});
	}

	const jwtPayload = {
		id: user.id,
		loggedIn: true,
	};

	const jwtToken = jwt.sign(jwtPayload, config.get('jwtKey'), {
		expiresIn: '1h',
	});

	return res.status(200).json({
		error: false,
		jwtToken,
		items: user.items,
	});
});

module.exports = router;
