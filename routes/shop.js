/* 
    SHOP RELATED ROUTE HANDLERS 
 */

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const { 
    Shop, validateShopEdit, 
    validatePasswordChange
} = require('../model/shop');
const { Change, validateChange } = require('../model/change');

// imported middleware
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

// route handler array of middlewares
const authAdminMiddleware = [ auth, admin ];
const authBodyMiddlewareEdit = [ auth, bodyValidator(validateShopEdit) ];
const adminIdMiddleware = [ auth, admin, idValidator ];
const authBodyMiddleware = [ auth, bodyValidator(validatePasswordChange) ];
const authBodyChangeMiddleware = [ auth, bodyValidator(validateChange) ];
const idAuthMiddleware = [ idValidator, auth ];

// !working
// route handler for getting all the shops in the db,
// only the name, email, phoneNumber and description is populated
router.get('/get-all', authAdminMiddleware, wrapper ( async ( req, res ) => {
    const shops = await Shop.find()
        .select({ 
            name: 1, description: 1, 
            email: 1, city: 1, 
            phoneNumber: 1
        });

    // response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: shops
    });
}));

// my shop
router.get('/my-shop', auth, wrapper ( async ( req, res ) => {
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

// !working
// route handler for getting a single shop by its id
router.get('/inspect/:id', adminIdMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const shop = await Shop.findById(id)
        .select({ 
            password: 0,
            credit: 0,
            change: 0
        });

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
}));

// !working
// bodyvalidator, auth
router.put('/edit-shop', authBodyMiddlewareEdit, wrapper ( async ( req, res ) => {
    const id = req.shop._id;
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

// ! working
// route handler for changing the password of a shop, only for shop owner
router.put('/change-password', authBodyMiddleware, wrapper ( async ( req, res ) => {
    const id = req.user._id;
    const shop = await Shop.findById(id);
    
    const { oldPassword, newPassword } = req.body;
    
    // comparing the saved password with the sent password
    const isValid = await bcrypt.compare(oldPassword, shop.password);

    if (!isValid) {
        // the input password doesnt match with the saved password
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs'
        });
    } else {
        // hashing of the old password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // setting and storing of the new password
        shop.set({
            password: hashedPassword
        });
        await shop.save();

        // success case
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        });
    }
}));

// !working too
// route handler for creating a change obejct in the shop document;
router.post('/add-change', authBodyChangeMiddleware, wrapper ( async ( req, res ) => {
    if (req.user) {
        // admin shouldnt deal with a shop affirs
        return res.status(400).json({
            status: 400,
            message: 'admin is not allowed here'
        });
    }

    const shopId = req.shop._id;
    const shop = await Shop.findById(shopId);

    // creating a new change document
    const { nameOfCollector, genderOfCollector, amount } = req.body;
    const change = new Change({
        nameOfCollector,
        genderOfCollector,
        amount
    });
    await change.save();

    // adding the change object id into the shop document and saving the shop
    shop.change.push(change._id);
    await shop.save();

    // success reponse
    res.status(201).json({
        status: 201,
        message: 'success',
        data: change
    });
}));

// ! working
// route handler for updating a change to being collected
router.put('/update-change/:id', idAuthMiddleware, wrapper ( async ( req, res ) => {
    if (req.user) {
        // admin shouldnt deal with a shop affirs
        return res.status(400).json({
            status: 400,
            message: 'admin is not allowed here'
        });
    }

    const { id } = req.params;
    const shopId = req.shop._id;

    const shop = await Shop.findById(shopId);
    const change = await Change.findById(id);

    if (shop.change.indexOf(id) < 0) {
        // the change object id isnt in the shop document
        return res.status(404).json({
            status: 404,
            message: 'the change object isnt in your db or invalid change id'
        });
    } else {
        if (change.collected) {
            // the change was already proccessed
            return res.status(400).json({
                status: 400,
                message: 'the change had once been processed'
            });
        } else {
            // setting the data and collected of the change document
            change.set({
                collected: true,
                dateOut: new Date()
            });
            await change.save();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: 'the update was successfully processed'
            });
        }
    }
}));

// !working 
// route handler for getting the yet to collect change from a shop
router.get('/change-not-collected', auth, wrapper ( async ( req, res ) => {
    if (req.user) {
        // admin shouldnt deal with a shop affirs
        return res.status(400).json({
            status: 400,
            message: 'admin is not allowed here'
        });
    }

    const shopId = req.shop._id;
    // querying and populating the change document of a shop
    // and also, filtering out the ones the change hasnt been colleted
    const toReturn = await Shop.findById(shopId)
        .select({ change: 1, _id: 0 })
        .populate({
            path: 'change',
            match: { collected: { $eq: false }}
        });

    if (toReturn.length == 0) {
        // when there is no one that is yet to collect change from the shop
        return res.status(404).json({
            status: 404,
            message: 'there is change that is not collected'
        })
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

// ! working
// route handler for getting all the change document in a shop document
router.get('/all-change', auth, wrapper ( async ( req, res ) => {
    if (req.user) {
        // admin shouldnt deal with a shop affirs
        return res.status(400).json({
            status: 400,
            message: 'admin is not allowed here'
        });
    }

    // querying and populating the shop change
    const shopId = req.shop._id;
    const toReturn = await Shop.findById(shopId)
        .select({ change: 1, _id: 0 })
        .populate({ path: 'change' });

    if (toReturn.length == 0) {
        // the shop has no change document id in its document
        res.status(404).json({
            status: 404,
            message: 'your shop has no change document in its db'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        })
    }
}));

// !working
router.get('/check-change/:id', idAuthMiddleware , wrapper ( async ( req, res ) => {
    if (req.user) {
        // admin shouldnt deal with a shop affirs
        return res.status(400).json({
            status: 400,
            message: 'admin is not allowed here'
        });
    }

    const { id } = req.params;

    // querying and populating the shop change
    const shopId = req.shop._id;
    const shop = await Shop.findById(shopId);
    const index = shop.change.indexOf(id);

    if (index < 0) {
        return res.status(404).json({
            status: 404,
            message: 'this change docuemnt isnt stored in your document'
        });
    } else {
        const change = await Change.findById(id);

        res.status(200).json({
            status: 200,
            message: 'success',
            data: change
        })
    }

}));

// ! working
// route handler for getting the list of change that has been collected for a shop
router.get('/collected-change', auth, wrapper ( async ( req, res ) => {
    if (req.user) {
        // admin shouldnt deal with a shop affirs
        return res.status(400).json({
            status: 400,
            message: 'admin is not allowed here'
        });
    }

    const shopId = req.shop._id;
    // querying the shop and populating the change documents
    const toReturn = await Shop.findById(shopId)
        .select({ change: 1, _id: 0 })
        .populate({
            path: 'change',
            match: { collected: { $eq: true }}
        });

    if (toReturn.length == 0) {
        // the length of the requests response is zero
        return res.status(404).json({
            status: 404,
            message: 'there is change that is not collected'
        })
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

// ! working perfectly
// route handler for deleting a shop, only for admin
router.delete('/remove/:id', adminIdMiddleware, wrapper ( async ( req, res ) => {
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