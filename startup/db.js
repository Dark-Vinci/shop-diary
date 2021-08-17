const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function () {
    mongoose.connect('mongodb://localhost/shop', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
    })
        .then(() => winston.info('connnected to the db'))
}