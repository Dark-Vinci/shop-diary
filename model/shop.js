/* 
    SHOP SCHEMA, MODEL, VALIDATION FUNCTIONS AND JWT GENERATOR
 */

// module dependencies 
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// const { changeSchema } = require('./change');
const mail = require('../middleware/mailer');

// the schema each shop in the db would be modelled around
const shopSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },

    email: {
        type: String,
        require: true,
        unique: true,
        minlength: 5
    },

    shopType: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },

    description: {
        type: String,
        minlength: 10,
        maxlength: 200
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    phoneNumber: {
        type: String,
        minlength: 10,
        maxlength: 15,
        required: true
    },

    city: {
        type: String,
        minlength: 2,
        maxlength: 50
    },

    password: {
        type: String,
        minlength: 20,
        maxlength: 1024,
        required: true
    },

    change: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Change'
    },

    credit: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Credit'
    }
});

// instance method of the shop schema for generating authentication tokens;
shopSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, config.get('jwtPass'));
    return token;
}

shopSchema.methods.sendMail = function (text) {
    mail(this.email, text);
}

// the shop model
const Shop = mongoose.model('Shop', shopSchema);

// validator function, validates the creation of a shop
function validateShop (input) {
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(50),

        email: Joi.string()
            .required()
            .email(),

        shopType: Joi.string()
            .required()
            .min(2)
            .max(30),

        description: Joi.string()
            .required()
            .min(10)
            .max(200),

        password: Joi.string()
            .required()
            .min(10)
            .max(50),

        city: Joi.string()
            .required()
            .min(2)
            .max(30),

        phoneNumber: Joi.string()
            .required()
            .min(10)
            .max(15)
    });

    const result = schema.validate(input);
    return result;
}

// validator function, validates the editing of a shop
function validateShopEdit (input) {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(50),

        shopType: Joi.string()
            .min(2)
            .max(30),

        description: Joi.string()
            .min(10)
            .max(200),

        city: Joi.string()
            .min(2)
            .max(30),

        phoneNumber: Joi.string()
            .min(10)
            .max(15)
    });

    const result = schema.validate(input);
    return result;
}

// validator function, validates changing of password of a shop
function validatePasswordChange (input) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(10)
            .max(50),

        newPassword: Joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(input);
    return result;
}

// validator function, validates the logining in of a shop
function validateShopLogin (input) {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email(),

        password: Joi.string()
            .required()
    });

    const result = schema.validate(input);
    return result;
}

// bundled export of this module
module.exports = {
    Shop,
    shopSchema,
    validateShop,
    validateShopEdit,
    validateShopLogin,
    validatePasswordChange
}