const mongoose = require('mongoose');
const winston = require('winston');

module.exports = () => {
  let db = '';
  if (process.env.NODE_ENV === 'test') {
    db = 'mongodb://localhost:27017/agro_mart_test';
  } else {
    db = process.env.MONGODB || 'mongodb://localhost:27017/agro_mart';
  }
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      if (!(process.env.NODE_ENV === 'test')) {
        console.log(`Connected to Database ${db}...`);
      }
      winston.info(`Connected to Database ${db}...`);
    });
};
