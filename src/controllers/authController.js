const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/userModel');
const emailMiddleware = require('../middlewares/emailMiddleware');
const axios = require('axios');  

// Registrar usuario
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const lowerCaseEmail = email.toLowerCase();
        const lowerCaseUsername = username.toLowerCase();
    
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
        }
    
        const existingUser = await userSchema.findOne({
            $or: [
                { email: lowerCaseEmail },
                { username: lowerCaseUsername }
            ],
            isDeleted: false
        });
    
        if (existingUser) {
            if (existingUser.email === lowerCaseEmail) {
                return res.status(400).json({ message: 'Este correo electrónico ya está registrado.' });
            }
            if (existingUser.username === lowerCaseUsername) {
                return res.status(400).json({ message: 'Este nombre de usuario ya está registrado.' });
            }
        }
    
        const user = new userSchema({ email: lowerCaseEmail, username: lowerCaseUsername, password });
        const savedUser = await user.save();
    
        res.status(201).json({
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email, 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario.', error: error.message });
    }
};

// Iniciar sesion
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userSchema.findOne({ email });
        
        if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
        }
 
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET ,{ expiresIn: '1d' });
        await user.save();
 
        res.json({ token: token, userId: user._id, message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor', error });
    }
};

// Verificar user para restablecer contraseña 
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email no válido' });
    }

    try {
        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

        user.resetPasswordOTP = otp;
        user.otpExpiration = Date.now() + 3600000;

        await user.save();

        await emailMiddleware.sendEmail(
            user.email,
            'Restablecimiento de Contraseña',
            `Estimado/a usuario/a,

Hemos recibido una solicitud para restablecer la contraseña de su cuenta en WithoutStress. Para continuar con el proceso, utilice el siguiente código de verificación:

**Código de verificación:** ${otp}

Por razones de seguridad, este código tiene una validez limitada. Si usted no ha solicitado este cambio, le recomendamos ignorar este mensaje.

Si necesita asistencia adicional, no dude en contactar a nuestro equipo de soporte.

Atentamente,  
Equipo de Soporte  
WithoutStress`
        );

        res.status(200).json({ message: 'Código OTP enviado al correo' });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
};

// Resstrablecer contraseña
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: 'Código OTP inválido' });
        }

        if (Date.now() > user.otpExpiration) {
            return res.status(400).json({ message: 'El código OTP ha expirado' });
        }

        user.password = newPassword; 
        user.resetPasswordOTP = undefined; 
        user.otpExpiration = undefined;

        await user.save(); 

        res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
};

// Verificar si el Username existe
exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.query; 
        const user = await userSchema.findOne({ username: username.toLowerCase() }); 
    
        if (user) {
          return res.json({ exists: true }); 
        } else {
          return res.json({ exists: false }); 
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error verificando Username' });
    }
};

// Verificar si el Email existe
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.query; 
        const user = await userSchema.findOne({ email: email.toLowerCase() });
    
        if (user) {
          return res.json({ exists: true }); 
        } else {
          return res.json({ exists: false }); 
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error verificando Email' });
    }
};

// Obtener frase del día
exports.getPhrase = async (req, res) => {
    try {
        const response = await axios.get('https://frasedeldia.azurewebsites.net/api/phrase');
        res.json(response.data);  
    } catch (error) {
        console.error('Error al obtener la frase:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener la frase', details: error.response ? error.response.data : error.message });
    }
};
