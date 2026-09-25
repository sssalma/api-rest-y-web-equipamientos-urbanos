/**
 * SERVIDOR PRINCIPAL - APLICACIÓN WEB CityEquip
 * - Consum de l'API REST interna
 * - Arquitectura MVC (Model-Vista-Controlador)
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const { initPassport } = require('./services/passportService');

const app = express();

// Conectar a MongoDB (para usuarios y sesiones)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' Conectat a MongoDB (web)'))
  .catch(err => console.error('Error MongoDB:', err));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

//Control de sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
    secure: false 
  }
}));

// Passport
initPassport();
app.use(passport.initialize()); 
app.use(passport.session());

// Missatges flash
app.use(flash());

// Method override PER ACCEPTAR PUT, DELETE I POST des del server
app.use(methodOverride('_method'));

// Variables globales para vistas
app.use((req, res, next) => {
  res.locals.user = req.user || null; //passo l'usuari si està loguejat
  res.locals.success = req.flash('success');  //missatge d'èxit
  res.locals.error = req.flash('error');      //missatge d'error
  next();
});

// Configuración de les vistes pq utilitzi PUG quan faci render()
app.set('view engine', 'pug');
app.set('views', './views');    //ruta de les views

// rutes
app.use('/', require('./routes/auth'));
app.use('/equipments', require('./routes/equipment'));
app.use('/rankings', require('./routes/rankings'));
app.use('/', require('./routes/ratings'));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'CityEquip - Equipamientos de Tarragona',
    user: req.user 
  });
});

// Control d'errors: 
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.stack);
  res.status(500).render('error', { 
    title: 'Error del servidor',
    user: req.user
  });
});


const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(` Aplicació web en http://localhost:${PORT}`);
});