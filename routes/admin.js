
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const wrapper = require('../middleware/wrapper');
const { Admin } = require('../model/admin');
const auth = require('./middleware/auth');
const admin = require('../middleware/admin');
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/isValidator');
const superAdmin = require('../middleware/superAdmin');

// ? only admins
router.get('/all-admin', wrapper ( async (req, res) => {
    const admins = await Admin.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    })
}));

// ? validaye id, only admins
router.get('/:id', wrapper ( async (req, res) => {
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

router.put('/:id', async (req, res) => {

});

router.delete('/:id', async (req, res) => {

});

module.exports = router;