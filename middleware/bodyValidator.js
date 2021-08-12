
// function to validate the body form request
module.exports = function (validate) {
    return (req, res, next) => {
        const { error } = validate(req.body);

        if (error) {
            // when theres is error in the form input
            return res.status(400).json({
                status: 400,
                message: error.details[0].message
            });
        } else {
            // no error detected, control is passed to 
            // the next middleware function
            next();
        }
    }
}