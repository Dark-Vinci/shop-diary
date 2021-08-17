const winston = require('winston');
require('winston-mongodb');

module.exports = function () {
    process.on('uncaughtException', (err) => {
        winston.log('error', err.message, err);
        process.exit(1); 
    });
    
    process.on('unhandledRejection', (err) => {
        throw(err)
    });
    
    winston.add(new winston.transports.File({ filename: 'muc.log' }));
    winston.add(new winston.transports.Console({ colorize: true, prettyPrint: true }))
    winston.add(new winston.transports.MongoDB({
        db: 'mongodb://localhost/changey',
        level: 'info'
        })
    ); 
}