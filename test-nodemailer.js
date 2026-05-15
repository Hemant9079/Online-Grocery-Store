const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hkumar954995@gmail.com',
        pass: 'buic ovur abep lenn',
    },
});

transporter.verify().then(() => {
    console.log("SUCCESS: Nodemailer accepted the password with spaces.");
}).catch((err) => {
    console.log("FAILED to authenticate:", err.message);
});
