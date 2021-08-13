/* 
    MODEL FOR ADMIN, AND ADMIN RELATED VALIDATIONS AND SCHEMA
 */

//module dependencies
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');


//creating the admin schema which is the template
// for every admin of this app
const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20,
        trim: true
    },

    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 60,
        unique: true
    },

    password: {
        type: String,
        minlength: 10,
        maxlength: 1024,
        required: true
    },

    power: {
        type: Number,
        min: 1,
        max: 3,
        default: 1,
        required: true
    }
});

// instance method for generating admin auth token
//this token encodes the power, id and isAdmin property
adminSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ 
        _id: this._id, 
        power: this.power, 
        isAdmin: true 
    }, config.get('jwtPass'));

    return token;
}

// compile the admin schema into a model
const Admin = mongoose.model('Admin', adminSchema);

// validates the creation of an admin
function validateAdmin (input) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .min(2)
            .max(20),

        email: Joi.string()
            .email()
            .required(),

        password: Joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(input);
    return result;
}

// validates the logging in of an admin
function validateAdminLogin (input) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required(),

        password: Joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(input);
    return result;
}

// validates the changing of password of an admin
function validateAdminChangePassword (input) {
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

// export boundle
module.exports = {
    Admin,
    adminSchema,
    validateAdmin,
    validateAdminLogin,
    validateAdminChangePassword
}