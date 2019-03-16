const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    if (!req.query.token) {
        return res.status(200).json({
            error: true,
            errorType: 'token',
            errorMessage: 'Access Denied. No token provided.'
        });
    }
    jwt.verify(req.query.token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                error: true,
                errorType: 'token',
                errorMessage: 'Invalid token.'
            });
        }
        req.user = decoded;
        next();
    });
}