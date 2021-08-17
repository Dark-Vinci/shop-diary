/* 
    CREDIT RELATED ROUTE HANDLER FOR SHOP AND ADMINS
 */

const express = require('express');
const router = express.Router();

const { 
    Credit, validatePaid, 
    validateMore, validateCredit 
} = require('../model/credit');
const { Shop } = require('../model/shop');

// middleware import
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/idValidator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// array of middleware for route hadlers
const idAuthMiddleware = [ idValidator, auth ];
const idAuthBody1 = [ idValidator, auth, bodyValidator(validatePaid) ];
const bodyAuthIdMiddleware = [ idValidator, auth, bodyValidator(validateMore) ];
const bodyAuthMiddleware = [ auth, bodyValidator(validateCredit) ];
const authAdminMiddleware = [ auth, admin ];

// !working
// validate id and authenticate
// route handler for getting one credit document, just by the admin
router.get('/get-one/:id', authAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const credit = await Credit.findById(id);

    if (!credit) {
        return res.status(404).json({
            status: 400,
            message: 'no credit with such id in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: credit
        });
    }
}));

// !for testing
router.get('/see/:id', idAuthMiddleware, async (req, res) => {
    const toSend = await Credit.findById(req.params.id)
    res.send(toSend);
})

// !working
router.get('/get-all', authAdminMiddleware, wrapper ( async ( req, res ) => {
    const credit = await Credit.find();

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: credit
    });
}));

// !working
// route handler for getting all the debtor of a shop
router.get('/my-debtors', auth, wrapper ( async ( req, res ) => {
    const shopId = req.shop._id;

    // querying the shop for debtor and then, populating the credit document
    const shopDebtors = await Shop.findById(shopId)
        .select({ credit: 1, _id: 0 })
        .populate({ 
            path: 'credit',
            select: { nameOfCollector: 1, genderOfCollector: 1 }
        });

    if (shopDebtors.length == 0) {
        // no debtor in the shop document
        return res.status(404).json({
            status: 404,
            message: `your store has no debtors`
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: shopDebtors
        });
    }
}));

// ! working
// route handler for getting the summary of a credit document
router.get('/debt-summary/:id', idAuthMiddleware, wrapper ( async ( req, res) => {
    const shopId = req.shop._id;
    const creditId = req.params.id;

    // query of the shop  
    const shop = await Shop.findById(shopId);
    const shopOnCredit = shop.credit;

    if (shopOnCredit.indexOf(creditId) < 0) {
        // the credit object id doesnt exist in the shop document
        return res.status(404).json({
            status: 404,
            message: 'no such credit id in your database'
        });
    } else {
        const credit = await Credit.findById(creditId);

        if (!credit) {
            // the credit object id doesnt exist in the db
            return res.status(404).json({
                status: 404,
                message: 'no such credit doesnt exist in the db'
            });
        } else {
            // generation of the summary object
            const toReturn = credit.getSummary();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: toReturn
            });
        }
    }
}));

// !working
// route handler for getting the payment timeline made by the debtor
router.get('/debt-timeline/:id', idAuthMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const shopId = req.shop._id;

    // query of the shop
    const shop = await Shop.findById(shopId);
    const shopOnCredit = shop.credit;

    if (shopOnCredit.indexOf(id) < 0) {
        // the credit object id doesnt exist in the shop document
        return res.status(404).json({
            status: 404,
            message: 'no such credit id in your database'
        });
    } else {
        // the credit object id exist and its been queried
        const credit = await Credit.findById(id);

        if (!credit) {
            // the credit document doesnt exist in the database
            return res.status(404).json({
                status: 404,
                message: 'no such credit doesnt exist in the db'
            });
        } else {
            // generating the paymentTimeline
            const toReturn = credit.paymentTimeline();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: toReturn
            });
        }
    }
}));

// !working
// route handler for getting the products bought by a user
router.get('/product-bought/:id', idAuthMiddleware, wrapper ( async ( req, res ) => {
    const id = req.params.id;
    const shopId = req.shop._id;

    // query of the shop document
    const shop = await Shop.findById(shopId);
    const shopOnCredit = shop.credit;

    if (shopOnCredit.indexOf(id) < 0) {
        // the credit object id isnt stored in the shop document
        return res.status(404).json({
            status: 404,
            message: 'no such credit id in your database'
        });
    } else {
        //  the credit document exist and its been queried
        const credit = await Credit.findById(id);

        // generating the credit bought
        const toReturn = credit.productBought();

        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));


// !working
// route handler for the creation of a credit document by shop owners
router.post('/create', bodyAuthMiddleware, wrapper ( async ( req, res ) => {
    const shopId = req.shop._id;
    const shop = await Shop.findById(shopId);

    // extracting the body of the request;
    const {
        nameOfCollector,
        initialPay,
        genderOfCollector,
        products
    } = req.body;

    console.log('here')
    // initializing the credit document
    const credit = new Credit({
        nameOfCollector,
        initialPay,
        genderOfCollector,
        products
    });

    // saving the credit document
    await credit.save();

    // saving and inserting the credit id into the shop document
    shop.credit.push(credit._id);
    await shop.save();

    // success response
    res.status(201).json({
        status: 201,
        message: 'success',
        data: credit
    });
}));

// !working
// route handler for adding to the dept of a debtor
router.put('/more-debt/:id', bodyAuthIdMiddleware, wrapper ( async ( req, res ) => {
    const shopId = req.shop._id;
    const { id } = req.params;
    const { product, price, amount } = req.body;

    // query of the shop and the credit document
    const credit = await Credit.findById(id);
    const shop = await Shop.findById(shopId);

    console.log('here')
    if (shop.credit.indexOf(id) < 0) {
        // when the credit id is not stored in the shop document
        return res.status(404).json({
            status: 404,
            message: 'the credit been searched isnt in your document'
        });
    } else { 
        credit.products.push({ product, price, amount })

        // saving of the credit document
        await credit.save();

        // successful update response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'the credit has been updated'
        });
    }
}));

// !working
// route handler for updating the amount paid by the debtor
router.put('/pay-debt/:id', idAuthBody1, wrapper ( async ( req, res ) => {
    const shopId = req.shop._id;
    const { id } = req.params;
    const { amountPaid } = req.body;

    // find the shop and credit document
    const credit = await Credit.findById(id);
    const shop = await Shop.findById(shopId);

    if (shop.credit.indexOf(id) < 0) {
        // when the credit id is not strored in the shop document
        return res.status(404).json({
            status: 404,
            message: 'the credit been searched isnt in your document'
        });
    } else {
        // when the credit id is stored in the shop document

        credit.amountPaid.push({ amount: amountPaid, datePaid: Date.now() });

        // update the completed property
        credit.completed = credit.getSummary().completed;

        // saving the shop document
        await credit.save();

        // successful update response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'the credit has been updated'
        });
    }
}));

// !working
// route handler for deleting a credit document from the db and shop
router.delete('/:id', idAuthMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const shopId = req.shop._id;

    // find the index of the credit object id in the shop document
    const shop = await Shop.findById(shopId);
    const index = shop.credit.indexOf(id);

    if (index < 0) {
        // case, no such object id in the shop document
        return res.status(404).json({
            status: 404,
            message: 'the credit been searched isnt in your document'
        });
    } else {
        // deleting and removing the credit from the db and shop
        shop.credit.splice(index, 1);
        await shop.save();
        await Credit.findByIdAndRemove(id);

        // successful removal response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'removed successfully'
        });
    }
}));

module.exports = router;