const User = require('../models/User');
const { validationResult } = require('express-validator');

// Formulari de registre d'usuari
exports.registerForm = (req, res) => {
  res.render('register', { 
    title: 'Registrarse',
    body: {} 
  });
};

// Processar registre - FUNCIÓ ACTUALMENT BUIDA!
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    console.log('Intentant registrar usuari:', email);
    
    // Validacions bàsiques
    if (!name || !email || !password || !confirmPassword) {
      req.flash('error', 'Tots els camps són obligatoris');
      return res.redirect('/register');
    }
    
    if (password !== confirmPassword) {
      req.flash('error', 'Les contrasenyes no coincideixen');
      return res.redirect('/register');
    }
    
    if (password.length < 6) {
      req.flash('error', 'La contrasenya ha de tenir almenys 6 caràcters');
      return res.redirect('/register');
    }
    
    // Verificar si l'usuari ja existeix
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash('error', 'Aquest correu ja està registrat');
      return res.redirect('/register');
    }
    
    // Crear nou usuari
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: email.toLowerCase().trim() // ← IMPORTANT per a passport
    });
    
    // Registrar amb passport-local-mongoose
    await User.register(newUser, password);
    
    console.log('Usuari registrat correctament:', email);
    req.flash('success', 'Registre complet! Ara pots iniciar sessió.');
    res.redirect('/login');
    
  } catch (error) {
    console.error('Error en el registre:', error);
    
    // Gestionar errors específics
    if (error.name === 'UserExistsError') {
      req.flash('error', 'L’usuari ja existeix');
    } else if (error.name === 'MissingPasswordError') {
      req.flash('error', 'La contrasenya és obligatòria');
    } else {
      req.flash('error', 'Error en el registre: ' + error.message);
    }
    
    res.redirect('/register');
  }
};

// Perfil de l'usuari
exports.account = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calcular estadístiques
    const totalRatings = user.ratings.length;
    const totalComments = user.ratings.filter(r => r.comment && r.comment.trim() !== '').length;
    
    // Obtenir equipaments únics valorats
    const uniqueEquipmentIds = [...new Set(user.ratings.map(r => r.equipmentId))];
    
    res.render('account', {
      title: 'El meu compte',
      user: user,
      stats: {
        totalRatings: totalRatings,
        totalComments: totalComments,
        uniqueEquipments: uniqueEquipmentIds.length
      }
    }); 
  } catch (error) {
    console.error('Error carregant el perfil:', error);
    req.flash('error', 'Error en carregar el perfil');
    res.redirect('/');
  }
};

// Valoracions de l'usuari
exports.myRatings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Obtenir les valoracions ordenades
    const sortedRatings = user.ratings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.render('my-ratings', {
      title: 'Les meves valoracions',
      user: user,
      ratings: sortedRatings
    });
    
  } catch (error) {
    console.error('Error carregant les valoracions:', error);
    req.flash('error', 'Error en carregar les teves valoracions');
    res.redirect('/account');
  }
};
