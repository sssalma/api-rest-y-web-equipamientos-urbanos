/**
 * SERVIDOR PRINCIPAL - API REST CityEquip Data Service
 * Aquí es configura i inicia el servidor Express per la gestió dels equipaments de la pràctica. 
 */


//carrego les variables d'entorn del .env i importo el express, mongoose per la bd
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); 

//és on tinc els endpoints continguts.
const equipmentRoutes = require('./routes/equipmentRoutes');
//creo una instancia del server i uso middlewear per parsejar json i forms html entrants
const app = express(); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// em conecto a la bd amb la uri en .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectat a MongoDB Atlas'))
  .catch(err => {
    console.error('Error conectant a MongoDB:', err);
    process.exit(1);
  });

// endpoints amb base a /equipments
app.use('/equipments', equipmentRoutes);

//endpoint arrel(debug)
app.get('/', (req, res) => {
  res.json({ 
    message: 'API CityEquip funcionando!', 
    version: '1.0',
    timestamp: new Date()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error al server' });
});


//inicio el servidor:
//port + iniciar-lo al port

const PORT = process.env.PORT; 
app.listen(PORT, () => {
  console.log(`Servidor express (API) en http://localhost:${PORT}`);
});