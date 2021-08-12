/* 
    CHANGE RELATED SCHEMA AND CHANGE VALIDATIONS
 */

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

// change schema, would be embeded into the shop schema
const changeSchema = new Schema({
    nameOfCollector: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },

    genderOfCollector: {
        type: String,
        required: true,
        enum: [ 'male', 'female' ]
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    dateIn: {
        type: Date,
        default: Date.now,
        required: true
    },

    dateOut: {
        type: Date
    },

    collected: {
        type: Boolean,
        default: false,
        required: true
    }
});

// compiling the change schema into a model
const Change = mongoose.model('Change', changeSchema);

// function for validating the request body for creating CHANGE
function validate (input) {
    const schema = Joi.object({
        nameOfCollector: Joi.string()
            .required()
            .min(3)
            .max(50),

        amount: Joi.number()
            .required()
            .min(0)
    });

    const result = schema.validate(input);
    return result;
}

module.exports = {
    Change,
    validate,
    changeSchema
}