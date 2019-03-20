const mongoose = require('mongoose');

module.exports = () => {
    let db = '';
    if (process.env.NODE_ENV === 'test') {
        db = 'mongodb://localhost:27017/my_blog_test'
    } else {
        db = 'mongodb://localhost:27017/my_blog';
    }
    mongoose.connect(process.env.MONGODB || db, { useNewUrlParser: true, useCreateIndex: true }).then(() => {
        console.log(`Connected to Database ${db}...`);
    });

    mongoose.Promise = global.Promise;
}