const passport = require('passport');
const User = require('../models/User');

// Mostra la pàgina de "login" quan l'usuari accedeix a /login
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
};
//processo login
exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    
    if (!user) { //autenticació falla
      req.flash('error','Email o contraseña incorrectos');
      return res.redirect('/login');
    }
    
    // tot ok
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash('success', `¡Bienvenido/a de nuevo, ${user.name}!`);
      
      // redirigeixo segons el rol
      const redirectTo = user.role === 'admin' ? '/equipments' : '/';
      return res.redirect(redirectTo);
    });
  })(req, res, next);
};

// logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Sesión cerrada correctamente');
    res.redirect('/');
  });
};

// verificació de l'autenticació
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Debes iniciar sesión para acceder a esta página');
  res.redirect('/login');
};

// verificar si soc administrador
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Acceso restringido: se requieren privilegios de administrador');
  res.redirect('/');
};