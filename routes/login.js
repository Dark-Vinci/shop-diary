/* 
    ROUTE HANDLER FOR LOGING IN A SHOP OWNER 
 */

    // module dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');

// middlewares, and validating function
const { Shop, validateShopLogin } = require('../model/shop');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');

// route handler for logging in the shop owner;
router.post('/', bodyValidator(validateShopLogin), wrapper ( async ( req, res) => {
    const { email, password } = req.body;

    const shop = await Shop.findOne({ email });

    if (!shop) {
        // no shop in the db with the sent email
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password'
        });
    } else {
        // case of valid email
        const isValid = await bcrypt.compare(password, shop.password);

        if (!isValid) {
            // case of invalid password
            return res.status(404).json({
                status: 404,
                message: 'invalid email or password'
            });
        } else {
            // both valid email and password
            const token = shop.generateAuthToken();
            const toReturn = _.pick(shop, [
                'name', 'email', 'shopType',
                'description', 'createdAt', 
                'phoneNumber', 'password',
                'change', 'credit', '_id'
            ]);

            // response, success
            res.header('x-auth-token', token)
                .status(200).json({
                    status: 200,
                    message: 'success',
                    data: toReturn
                });
        }
    }
}));

module.exports = router;