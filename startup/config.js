const config = require('config');

module.exports = function () {
    if (!config.get('jwtPass')) {
        throw new Error('go define jwt key')
    }
} 