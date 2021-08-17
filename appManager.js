

module.exports = function (app) {
    require('./startup/logger')();
    require('./startup/config')();
    require('./startup/db')();
    require('./startup/route')(app);

}