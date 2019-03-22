const express = require('express');

const app = express();
require('./db/mongoose')();
require('./startup/logging')();
require('./startup/routes')(app);

const port = process.env.PORT || 5000;
// Server
const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = server;