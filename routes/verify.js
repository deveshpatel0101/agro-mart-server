const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.post('/', (req, res) => {
    if (req.body.token) {
        jwt.verify(req.query.token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.status(200).json({
                    tokenStatus: 'invalid'
                });
            } else {
                res.status(200).json({
                    tokenStatus: 'valid'
                });
            }
        });
    }
});

module.exports = router;