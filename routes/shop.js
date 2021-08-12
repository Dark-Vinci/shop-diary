/* 
    SHOP RELATED ROUTE HANDLERS 
 */

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const { 
    Shop, validateShopEdit, 
    validateChangePassword 
} = require('../model/shop');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

const authAdminMiddleware = [ auth, admin ];
const authBodyMiddleware = [ auth, bodyValidator(validateShopEdit) ];
const adminIdMiddleware = [ auth, admin, idValidator ];
const authBodyMiddleware = [ auth, bodyValidator(validateChangePassword) ];

// route handler for getting all the shops in the db,
// only the name, email, phoneNumber and description is populated
router.get('/get-all', authAdminMiddleware, wrapper ( async (req, res) => {
    const shops = await Shop.find()
        .select({ 
            name: 1, description: 1, 
            email: 1, city: 1, 
            phoneNumbe: 1
        });

    // response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: shops
    });
}));

// my shop
router.get('/my-shop', auth, wrapper ( async (req, res) => {
    const id = req.shop._id;
    const shop = await Shop.findById(id)
        .select({ password: 0 });

    // response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: shop
    });
}));

// route handler for getting a single shop by its id
router.get('/:id', adminIdMiddleware, async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findById(id)
        .select({ password: 0 });

    if (!shop) {
        // response for invalid shop id
        return res.status(404).json({
            status: 404,
            message: 'no shop with the id in the db'
        });
    } else {
        // a valid shop id case
        res.status(200).json({
            status: 200,
            message: 'success',
            data: shop
        });
    }
});

// !only shop owner or admin
// bodyvalidator, auth
router.put('/edit-shop', authBodyMiddleware, wrapper ( async (req, res) => {
    const id = req.user._id;
    const { name, shopType, description, city, phoneNumber } = req.body;

    const shop = await Shop.findById(id)
        .select({ password: 0 });

    // set and save the shop document
    shop.set({
        name: name || shop.name,
        shopType: shopType || shop.shopType,
        description: description || shop.description,
        city: city || shop.city,
        phoneNumber: phoneNumber || shop.phoneNumber
    });
    await shop.save();

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: shop
    })
}));

// route handler for changing the password of a shop, only for shop owner
router.put('/change-password', authBodyMiddleware, wrapper ( async (req, res) => {
    const id = req.user._id;
    const shop = await Shop.findById(id);
    
    const { oldPassword, newPassword } = req.body;
    
    const isValid = await bcrypt.compare(oldPassword, shop.password);

    if (!isValid) {
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs'
        });
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        shop.set({
            password: hashedPassword
        });
        await shop.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        })
    }
}));

// route handler for deleting a shop, only for admin
router.delete('/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const shop = await Shop.findByIdAndRemove(id);

    if (!shop) {
        // shop is non existence in the db
        return res.status(404).json({
            status: 404,
            message: 'no such shop in the db'
        });
    } else {
        // case when the shop exist and has been deleted
        res.status(200).json({
            status: 200,
            message: 'success',
            data: shop
        });
    }
}));

module.exports = router;