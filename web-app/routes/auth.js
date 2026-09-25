const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { isLoggedIn } = authController; //middleware per comprobar que está logejat

// endoints get
router.get('/register', userController.registerForm);
router.get('/login', authController.loginForm);

// register
router.post('/register', userController.registerUser);

// login
router.post('/login', authController.loginUser);

// logout
router.get('/logout', authController.logout);

//pàgines que requereixen estar loggejat
router.get('/account', isLoggedIn, userController.account);
router.get('/my-ratings', isLoggedIn, userController.myRatings);
module.exports = router;