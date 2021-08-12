// MIDDLEWARE TO DETERMINE A SUPER ADMIN, 
// A SUPER ADMIN IS THE HIGHEST TYPE OF RANK IN ADMINS

module.exports = function (req, res, next) {
    const power = +req.user.power;

    if (power < 3) {
        // not a super admin, req is terminated
        return res.status(403).json({
            status: 403,
            message: 'no try am again, oga go kill you'
        });
    } else {
        // a superadmin, req is passed to the next
        // middleware function in the req, res pipeline
        next();
    }
}