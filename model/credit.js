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
        type: [
            {
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
            }
        ],

        validate: {
            validator: function (v) {
                return v && v.length > 0
            },
            message: 'the debtors should buy at least one product'
        }
    },

    amountPaid: {
        type: [
            {
                datePaid: { type: Date, required: true, default: Date.now },
                amount: { type: Number, required: true, min: 0 }
            }
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

// instance method to generate the amout to be paid by the debtor;
creditSchema.methods.getSummary = function () {
    // initialize initialpay, produvts bought and amountPaid
    const initialPay = this.initialPay;
    const amountPaid = this.amountPaid;
    const products = this.products;

    // calculating the real amount paid from the array of amountPaid schema 
    const realAmountPaid = amountPaid.map((element) => {
        return element.amountPaid;
    }).reduce((a, b) => {
        return a + b
    }, 0);

    // calculating the total Price paid from array fo product schema
    const totalProductPrice = products.map((product) => {
        return product.price * product.quantity;
    }).reduce((a, b) => {
        return a + b;
    }, 0);

    // the amount left to pay;
    const debt = totalProductPrice - realAmountPaid - initialPay;

    // data to be returned
    const toReturn = { 
        totalProductPrice,
        amountPaid: realAmountPaid,
        initialAmountPaid: initialPay,
        debt: debt,
        completed: debt == 0
    }

    return toReturn;
}

// instance method to get the payment timeline
creditSchema.methods.paymentTimeline = function () {
    const paymentTimeline = this.amountPaid;

    let toReturn = {
        [this.createdAt] : this.initialPay
    };

    for (let i of paymentTimeline) {
        toReturn[i].datePaid = i.amountPaid;
    }

    return toReturn;
}

// instance method to get the products bought by the debtor
creditSchema.methods.productBought = function () {
    const toReturn = this.products;
    return toReturn;
}

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

function validateMore (input) {
    const schema = Joi.object({
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
    });

    const result = schema.validate(input);
    return result;
}

function validatePaid (input) {
    const schema = Joi.object({
        amountPaid: Joi.number()
            .min(0)
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
    validateMore,
    validatePaid,
    validateCreditEdit
}

/* 
    products: {
        array of object containing product, price, qauntity
        of the product that was bought on credit
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
        ],
        validate: {
            validator: function (v) {
                return v && v.length > 0
            },
            message: 'the debtors should buy at least one product'
        }
    },


        amountPaid: {
        array of object containing the date payed and amount paid
        type: [
            new Schema({
                datePaid: { type: Date, required: true },
                amountPaid: { type: Number, required: true, min: 0 }
            })
        ]
    },
 */