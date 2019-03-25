const winston = require('winston');

module.exports = function(err, req, res, next) {
  winston.error(err.message, err);
  res.status(500).json({
    error: true,
    errorType: 'unexpected',
    errorMessage: err,
  });
};
