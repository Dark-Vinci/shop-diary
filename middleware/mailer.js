const nodemailer = require('nodemailer');

module.exports = function (customerMail, text) {
    // magic happens here
    const mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ademolaolutomiwa4real@gmail.com',
            pass: '1234567890'
        }
    });

    const mailDetails = {
        from: 'ademolaolutomiwa4real@gmail.com',
        to: customerMail,
        subject: 'welcome',
        text: text
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('Error')
        } else {
            console.log('email sent')
        }
    });
}