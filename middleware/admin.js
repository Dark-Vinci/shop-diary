/* 
    MIDDLEWARE FOR FILTERING OUT AN ADMIN AND OTHERWISE
 */

module.exports = function (req, res, next) {
    const isAdmin = req.user.isAdmin;

    if (!isAdmin) {
        // user is not an admin
        return res.status(403).json({
            status: 403,
            message: 'no try am again, or make dem close your shop?'
        })
    } else {
        // the user is an admin
        next();
    }
}