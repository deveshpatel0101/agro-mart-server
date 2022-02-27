const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

module.exports = () => {
	let db = config.get('mongodb');

	mongoose
		.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log(`Connected to Database...`);
			winston.info(`Connected to Database...`);
		});
};
