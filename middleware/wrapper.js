
// middleware to catch exeption in async route handlers
module.exports = function (handler) {
    return async (req, res, next) => {
        try {
            // success case
            await handler(req, res);
        } catch (ex) {
            // error case, control is passed to the error middleware
            next(ex)
        }
    }
}