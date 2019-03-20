const express = require('express');

const app = express();
require('./db/mongoose')();
require('./startup/logging')();
require('./startup/routes')(app);

const port = process.env.PORT || 5000;
// Server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});