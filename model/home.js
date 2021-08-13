/* 
    HOME RELATED SCHEMA, MODEL AND VALIDATION FUNCTION 
    */

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

// home schema
const homeSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20,
        trim: true
    },

    description1: {
        type: String,
        required: true,
        minlength: 15,
        maxlength: 300
    },

    description1: {
        type: String,
        minlength: 15,
        maxlength: 300
    },

    createdAt: {
        type: Date, 
        required: true,
        default: Date.now
    },

    imageLink: {
        type: String,
        required: true
    },

    isPublished: {
        type: Boolean,
        default: false,
        required: true
    }
});

// compile home schema to home model
const Home = mongoose.model('Home', homeSchema);

// function for validating home creation
function validateHome (input) {
    const schema = Joi.object({
        title: Joi.string()
            .required()
            .min(3)
            .max(15),

        description1: Joi.string()
            .required()
            .min(15)
            .max(300),

        description2: Joi.string()
            .min(15)
            .max(300),

        imageLink: Joi.string()
            .required()
    });

    const result = schema.validate(input);
    return result;
}

// function for validating the editing of home object
function validateHomeEdit (input) {
    const schema = Joi.object({
        title: Joi.string()
            .min(3)
            .max(15),

        description1: Joi.string()
            .min(15)
            .max(300),

        description2: Joi.string()
            .min(15)
            .max(300),

        imageLink: Joi.string()
    });

    const result = schema.validate(input);
    return result;
}

// bulk export
module.exports = {
    Home,
    validateHome,
    validateHomeEdit
}