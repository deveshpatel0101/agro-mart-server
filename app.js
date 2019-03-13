const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('./db/mongoose');
const blog = require('./routes/blogs');
const shared = require('./routes/shared');
const login = require('./routes/login')
const register = require('./routes/register');
const verify = require('./routes/verify');
const google = require('./routes/google');

const app = express();
const port = process.env.PORT || 5000;

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/user/auth/google', google);

app.use('/user/blogs', blog);

app.use('/public/', shared);

app.use('/user/login', login);

app.use('/user/register', register);

app.use('/user/verify', verify);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});