/* 
    FILE FOR HOME REALTED DOCUMENT FOR THE APP 
*/

const express = require('express');
const router = express.Router();

const { Home, validateHome, validateHomeEdit } = require('../model/home');

// imported middleware
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/idValidator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const wrapper = require('../middleware/wrapper');

// array of middleware for route handlers
const homeEditMiddleware = [ idValidator, auth, admin, bodyValidator(validateHomeEdit) ];
const homeCreationMiddleware = [ auth, admin, bodyValidator(validateHome) ];
const idAdminMiddleware = [  idValidator, auth, admin ];
const authAdmin = [ auth, admin ];

// ! 100% working
// router for the home page of the website
router.get('/', wrapper ( async ( req, res ) => {
    const homes = await Home.find({ isPublished: true });

    if (homes.length == 0) {
        // when theres is no published home document
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: 'welcome to the collector home'
        });
    } else {
        // !yet to check
        // choosing the last published home document
        const lastPublishedHome = homes[homes.length - 1];

        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: lastPublishedHome
        });
    }
}));

// !works more than magic
// route handler for getting all published home documents in the db
router.get('/all-published', authAdmin, wrapper ( async ( req, res ) => {
    const homes = await Home.find({ isPublished: true })
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    });
}));

// !works like magic
// route handler for getting all non published home documents in the db
router.get('/not-published', authAdmin, wrapper ( async ( req, res ) => {
    const homes = await Home.find({ isPublished: false })
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    });
}));

// !working
// route hander for getting a home document by id
router.get('/inspect/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const home = await Home.findById(id);

    if (!home) {
        // home document doesnt exist in the database
        return res.status(404).json({
            status: 404,
            message: 'home not found1'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

// ! this worked outright
// route handler for editing an unpublished home document
router.put('/edit/:id', homeEditMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    // querying the home document
    const home = await Home.findById(id);

    if(!home) {
        // home document doesnt exist in the db
        return res.status(404).json({
            status: 404,
            message: 'home not found'
        });
    } else {
        if (home.isPublished) {
            // a published cant be modified
            return res.status(400).json({
                status: 400,
                message: 'cant modify a published home'
            });
        } else {
            const { title, description1, description2, imageLink } = req.body;

            // reseting the home document
            home.set({
                title: title || home.title,
                description1: description1 || home.description1,
                description2: description2 || home.description2,
                imageLink: imageLink || home.imageLink 
            });

            // saving the home document
            await home.save();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: home
            });
        }
    }
}));

// !working well
// route handler for publishing a home document
router.put('/publish/:id', idAdminMiddleware , wrapper ( async ( req, res ) => {
    // query the document with its id
    const { id } = req.params;
    const home = await Home.findByIdAndUpdate(id, {
        $set: { isPublished: true }
    }, { new: true});

    if (!home) {
        // home document not found
        return res.status(404).json({
            status: 404,
            message: 'home not found'
        });
    } else {
        // home document successfully published
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

// !working perfectly
// route handler for the creation of home document
router.post('/create', homeCreationMiddleware , wrapper ( async ( req, res ) => {
    const { title, description1, description2, imageLink } = req.body;

    // initailizing the home document
    const home = new Home({
        title,
        description1,
        description2,
        imageLink
    });

    // saving the home document to the db
    await home.save();

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: home
    });
}));

// !in good condition
// route handler for deleting a home document from the db
router.delete('/remove/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const home = await Home.findByIdAndRemove(id);

    if (!home) {
        // home document isnt in the database
        return res.status(404).json({
            status: 404,
            message: 'Home not found'
        })
    } else {
        // success, home document was successfuly deleted
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

module.exports = router;