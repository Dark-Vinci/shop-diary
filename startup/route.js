const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');

const login = require('../routes/login');
const register = require('../routes/register');
const shop = require('../routes/shop');
const admin = require('../routes/admin');
const credit = require('../routes/credit');
const home = require('../routes/home');
const error = require('../middleware/error');

module.exports = function (app) {
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    if (app.get('env') == 'development') {
        app.use(morgan('tiny'));
    }

    app.use('/api/login', login);
    app.use('/api/register', register);
    app.use('/api/shop', shop);
    app.use('/api/admin', admin);
    app.use('/api/credit', credit);
    app.use('/api/home', home);
    app.use(error)
}