
const express = require('express');
const router = express.Router();

// Importo el controlador amb la lògica pels rankings
const rankingController = require('../controllers/rankingController');

// Quan l'usuari entra a /rankings, es crida showRankings del controlador
router.get('/', rankingController.showRankings);

module.exports = router;
