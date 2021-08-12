/* 
    CREDIT SHOPPING RELATED MODEL, VALIDATING FUNCTION,
    AND SCHEMA
 */

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

// schema for the CREDIT document, would be embeded into shop schema
const creditSchema = new Schema({
    nameOfCollector: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true
    },

    products: {
        // array of object containing product, price, qauntity
        // of the product that was bought on credit
        type: [
            new Schema({
                product: { 
                    type: String,
                    required: true,
                    minlength: 2,
                    maxlength: 100
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                    set: v => v.toFixed(2),
                    get: v => v.toFixed(2)
                },

                quantity: {
                    type: Number,
                    default: 1,
                    required: true,
                    min: 1
                }
            })
        ]
    },

    amountPaid: {
        // array of object containing the date payed and amount paid
        type: [
            new Schema({
                datePaid: { type: Date, required: true },
                amountPaid: { type: Number, required: true, min: 0 }
            })
        ]
    },

    // amount payed by the collector before taking the products
    initialPay: {
        type: Number,
        default: 0,
        min: 0
    },

    genderOfCollector: {
        type: String,
        required: true,
        enum: [ 'male', 'female' ]
    },

    completed: {
        type: Boolean,
        required: true, 
        default: false
    }
});

// compiling the schema into a model
const Credit = mongoose.model('Credit', creditSchema);

// validator function, validates the creation of a credit document
function validateCredit (input) {
    // validating the products object
    const productSchema = Joi.object().keys({
        products: Joi.array().items(Joi.object({
            product: Joi.string()
                .required()
                .min(2)
                .max(100),

            price: Joi.number()
                .required()
                .min(0),

            amount: Joi.number()
                .integer()
                .min(1)
        }))
    });

    // the main schema of the credit
    const schema = Joi.object({
        nameOfCollector: Joi.string()
            .required()
            .min(3)
            .min(50),

        amount:  Joi.number()
            .required()
            .min(0),

        genderOfCollector: Joi.string()
            .required()
            .min(4)
            .max(6),

        initialPay: Joi.number()
            .min(0),

        products: productSchema
    });

    const result = schema.validate(input);
    return result;
}

// validate function, for validating the payment made after 
// the collection of the products
function validateCreditEdit (input) {
    const schema = Joi.object({
        amountPaid: Joi.number()
            .required()
    });

    const result = schema.validate(input);
    return result;
}

// boundle export
module.exports = {
    Credit,
    validateCredit,
    creditSchema,
    validateCreditEdit
}