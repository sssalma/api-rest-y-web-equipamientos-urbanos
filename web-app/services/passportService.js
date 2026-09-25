

//configuració del passport per autenticació

const passport = require('passport');
const User = require('../models/User');

function initPassport() {

  //estrategia usuari+contrassenya sobre l USER
  passport.use(User.createStrategy());
  
  passport.serializeUser(User.serializeUser());
  
  passport.deserializeUser(User.deserializeUser());
}
//exporto per utilitzar
module.exports = { initPassport };