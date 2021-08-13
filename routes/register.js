/* 
    ROUTE HANDLER FOR REGISTERING A SHOP 
 */

// module dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');

// middlewares, and validating function
const { Shop, validateShop } = require('../model/shop');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');

// !working 95%
// route handler for registering a new shop
router.post('/', bodyValidator(validateShop), wrapper ( async (req, res) => {
    const { 
        email, phoneNumber, 
        password, shopType, 
        description, name, city
    } = req.body;

    // find if a shop exist with same email,
    let shop = await Shop.findOne({ email });

    if (shop) {
        // a shop exist with the same email, 400 respose
        return res.status(400).json({
            status: 400,
            message: 'a shop already exist with same email'
        })
    } else {
        // hash the sent password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create the shop
        shop = new Shop({
            email, name, shopType,
            phoneNumber,  city,
            description, 
            password: hashedPassword
        });

        // save the shop
        await shop.save();

        // generate auth token and return values
        const token = shop.generateAuthToken();
        shop.sendMail('welcome'); // ! not working yet

        const toReturn = _.pick(shop, [
            'name', 'email', 'shopType',
            'description', 'createdAt', 
            'phoneNumber', '_id',
            'change', 'credit'
        ]);

        // response, success
        res.header('x-auth-token', token)
            .status(201).json({
                status: 201,
                message: 'success',
                data: toReturn
            });
    }
}));

module.exports = router;