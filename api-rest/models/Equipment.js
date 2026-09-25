/**
 * MODEL EQUIPMENT - Esquema de MongoDB 
 * 
 * Determina l'estructura de dades que representa un equipament urbà.
 * 
 */

//importo la llibreria mongoose per treballar amb mongdb
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String},
  address: String,
  latitude: { type: Number},
  longitude: { type: Number },
  description: String,
  schedule: String,      // horari
  phone: String,         // telefon
  district: String,      // districte
  isMunicipal: Boolean,  // municipal
  code: String,          // CODI_ENS
  entity: String         // NOM_ENS
}, {
  timestamps: true
});

//creo un model Equipment 
// que conté les dades de cada equipament (desat a equipmentSchema) 
// i l'exporto per utilitzarlo en routes/controllers
module.exports = mongoose.model('Equipment', equipmentSchema);