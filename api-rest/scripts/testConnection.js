///test per la connexió

require('dotenv').config();
const mongoose = require('mongoose');

// La URI completa es llegeix del .env, no es guarda mai al codi
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI al .env (mira .env.example)');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('  conectat a MongoDB'))
  .catch(err => console.error('no conectat, error : ', err))
  .finally(() => mongoose.connection.close());
