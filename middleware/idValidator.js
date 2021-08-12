const mongoose = require('mongoose');

// middleware for validating object id in the url
module.exports = function (req, res, next) {
    const q = req.params;
    const test = mongoose.Types.ObjectId;

    if (!test.isValid(q.id)) {
        // q.id is not an invalid mongoose object id;
        return res.status(404).json({
            status: 404,
            message: 'not a valid object id'
        })
    } else {
        // q.id is avalid object id, control is passed to 
        // the next middleware function
        next()
    }
}