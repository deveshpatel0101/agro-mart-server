const bodyParser = require('body-parser');

const blog = require('../routes/blogs');
const shared = require('../routes/shared');
const login = require('../routes/login')
const register = require('../routes/register');
const google = require('../routes/google');
const error = require('../middleware/error');

module.exports = (app) => {
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
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // REST API's
    app.use('/user/auth/google', google);
    app.use('/user/blogs', blog);
    app.use('/public/shared', shared);
    app.use('/user/login', login);
    app.use('/user/register', register);
    app.use(error);
}