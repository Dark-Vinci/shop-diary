
// middleware for catching any error that occurs in
// any async route handlers
module.exports = function (ex, req, res, next) {
    res.status(500).json({
        status: 500,
        message: ex.message
    })
}