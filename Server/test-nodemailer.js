import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hkumar954995@gmail.com',
        pass: 'buic ovur abep lenn',
    },
});

transporter.verify().then(() => {
    console.log("SUCCESS: Nodemailer accepted the password with spaces.");
    process.exit(0);
}).catch((err) => {
    console.log("FAILED to authenticate:", err.message);
    process.exit(1);
});
