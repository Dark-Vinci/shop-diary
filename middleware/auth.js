/* 
    MIDDLEWARE FOR AUTHENTICATING USERS TOKEN 
*/

const config = require('config');
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        // theres is no token in the header of the request
        return res.status(401).json({
            status: 401,
            message: 'no token provided'
        });
    } else {
        // !console.log('here')
        try {
            // decode the sent jwt
            const decoded = jwt.verify(token, config.get('jwtPass'));
            if (decoded.isAdmin) {
                req.user = decoded;
            } else {
                req.shop = decoded;
            }

            next();
        } catch (ex) {
            // execption which is caused by invalid token
            return res.status(400).json({
                status: 400,
                message: 'invalid token was provided'
            });
        }
    }
}