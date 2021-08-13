const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const mongoose = require('mongoose');

const login = require('./routes/login');
const register = require('./routes/register');
const shop = require('./routes/shop');
const admin = require('./routes/admin');
const credit = require('./routes/credit');
const home = require('./routes/home');

const app = express();

mongoose.connect('mongodb://localhost/shop', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
    .then(() => console.log('connnected to the db'))
    .catch((ex) => console.log('couldnt connect to the db because of ', ex.message));

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

if (!config.get('jwtPass')) {
    console.log('go define your jwt password');
    process.exit(1);
}

app.get('/', ( req, res ) => {
    res.status(200).json({
        status: 200,
        message: 'success',
        data: 'welcome to the collector'
    });
});

const port = process.env.PORT || 1818;
app.listen(port, () => console.log(`listening on port ${ port }`));