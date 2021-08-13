/* 
    ADMIN RELATED ROUTE HANDLERS 
    */


const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

// imported dependencies
const wrapper = require('../middleware/wrapper');
const { 
    Admin, validateAdmin, 
    validateAdminLogin,
    validateAdminChangePassword
} = require('../model/admin');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/idValidator');
const superAdmin = require('../middleware/superAdmin');

// array of middleware for route handlers
const authAdmin = [ auth, admin ];
const idSuperAdmin = [ idValidator, auth, admin, superAdmin ];
const authAdminBodyMiddleware = [ 
    auth, admin, bodyValidator(validateAdminChangePassword) 
];
const authAdminId = [ idValidator, auth, admin ];


// !working
// ? only admins
router.get('/all-admin', authAdmin, wrapper ( async ( req, res ) => {
    const admins = await Admin.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    })
}));

// !working
// ? validaye id, only admins
router.get('/:id', authAdminId, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const admin = await Admin.findById(id)
        .select({ password: 0 });

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
}));

// !working
// route handler for reducing the power of an admin 
router.put('/reduce/:id', idSuperAdmin, wrapper ( async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
        // admin not found
        return res.status(404).json({
            status: 404,
            message: 'admin not found'
        });
    } else {
        // check if the power is 3 or more
        if (admin.power <= 1) {
            // bad request for admin with a power of 3 or more
            return res.status(400).json({
                status: 400,
                message: 'an admin power cant be less than 1'
            });
        } else {
            // the decrement and saving of the admin
            admin.power -= 1;
            await admin.save();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: `the power of ${ admin.username } has been reduced`
            })
        }
    }
}));

// !working
// route handler for increasing the power of an admin
router.put('/empower/:id', idSuperAdmin, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
        // admin not found
        return res.status(404).json({
            status: 404,
            message: 'admin not found'
        });
    } else {
        // check if the power is 3 or more
        if (admin.power >= 3) {
            // bad request for admin with a power of 3 or more
            return res.status(400).json({
                status: 400,
                message: 'an admin power cant be more than 3'
            });
        } else {
            // the increment and saving of the admin
            admin.power += 1;
            await admin.save();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: `the power of ${ admin.username } has been increased`
            })
        }
    }
}));

// !working
// route handler for changing an admin password, by admin
router.put('/change-password', authAdminBodyMiddleware, wrapper ( async ( req, res ) => {
    const id = req.user._id;
    const admin = await Admin.findById(id);

    const { oldPassword, newPassword } = req.body;

    // comparing the old password with the admin password
    const isValid = await bcrypt.compare(oldPassword, admin.password);

    if (!isValid) {
        // invalid oldpassword
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs parameters'
        });
    } else {
        // hashing of the new password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        // setting and saving the admin password
        admin.set({
            password: hashed
        });
        await admin.save();

        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is ${ newPassword }`
        });
    }
}));

// !working
// route handler for logging in an admin
router.post('/login', bodyValidator(validateAdminLogin), wrapper ( async ( req, res ) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
        // invalid email
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password'
        });
    } else {
        // verify the password
        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            // invalid password
            return res.status(404).json({
                status: 404,
                message: 'invalid email or password'
            });
        } else {
            // info to be returned
            const token = admin.generateAuthToken();
            const toReturn = _.pick(admin, ['_id', 'power', 'email', 'username']);

            // success reponse
            res.header('x-auth-token', token)
                .status(200).json({
                    status: 200,
                    message: 'success',
                    data: toReturn
                })
        }
    }
}));

// !working
// route handler for creating an admin
router.post('/register', bodyValidator(validateAdmin), wrapper ( async (req, res) => {
    // check the number of admin in the db
    const adminNumber = await Admin.find().count();

    if (adminNumber >= 3) {
        // if the number of admin is 3 or more, no admin should be saved
        return res.status(400).json({
            status: 400,
            message: 'we cant have more than 3 admins'
        });
    } else {
        // case when admin is less than 3
        const { username, password, email } = req.body;

        // check if theres an admin with same email
        let admin = await Admin.findOne({ email });

        if (admin) {
            // bad request when theres an admin with same email
            return res.status(400).json({
                status: 400,
                message: 'an admin already exist with same email'
            });
        } else {
            // create and store admin
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // creation
            admin = new Admin({
                username,
                email,
                password: hashed
            });

            // making the first registered admin the super admin
            if (adminNumber == 0) {
                admin.power = 3;
            }

            await admin.save();

            const token = admin.generateAuthToken();
            const toReturn = _.pick(admin, ['username', 'email', 'power', '_id']);

            // success response
            res.header('x-auth-token', token)
                .status(201).json({
                    status: 201,
                    message: 'success',
                    data: toReturn
                });
        }
    }
}));

// !working
// route handler for deleting an admin
router.delete('/remove/:id', idSuperAdmin, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    const admin = await Admin.findByIdAndRemove(id)
        .select({ password: 0 });

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin with the is in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
}));

module.exports = router;