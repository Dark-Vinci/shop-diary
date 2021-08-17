const express = require('express');
const winston = require('winston');

const app = express();

require('./appManager')(app);

const port = process.env.PORT || 1818;
app.listen(port, () => winston.info(`listening on port ${ port }`));