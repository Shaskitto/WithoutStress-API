const nodemailer = require('nodemailer');

// Configuración del transportador para el envío de correos
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS,  
    },
});

// Función para enviar correos
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.GMAIL_USER, 
        to: to,
        subject: subject,
        text: text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: ' + info.response);
    } catch (error) {
        console.error('Error al enviar el correo: ' + error);
    }
};

module.exports = { sendEmail };