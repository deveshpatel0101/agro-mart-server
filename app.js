const express = require('express');
const bodyParser = require('body-parser');

require('./db/mongoose');
const blog = require('./routes/blogs');
const shared = require('./routes/shared');
const login = require('./routes/login')
const register = require('./routes/register');
const google = require('./routes/google');

const app = express();
const port = process.env.PORT || 5000;

// CORS Handler
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});


// Serving static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/dashboard', (_, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/user/login', (_, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/user/register', (_, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/create', (_, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/public/shared', (_, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/error', (_, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// REST API's
app.use('/user/auth/google', google);

app.use('/user/blogs', blog);

app.use('/public/', shared);

app.use('/user/login', login);

app.use('/user/register', register);


// Server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});