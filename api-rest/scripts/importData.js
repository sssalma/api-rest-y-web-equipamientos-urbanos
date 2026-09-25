// Script per netjar les dades del csv i importarles.


//llibreries necessaries
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { parse } = require('csv-parse/sync');
const Equipment = require('../models/Equipment');

//carrego les variables d'entorn + ruta del csv
require('dotenv').config();
const CSV_PATH = path.join(__dirname, '../data', 'equipamientos.csv');

//mongodb
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' Conexió a MongoDB OK'))
  .catch(err => {
    console.error('Error en la conexió:', err);
    process.exit(1);
  });

//normalitzo el text per no tenir districtes CENTRE i centre
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/\s+/g, ' ')             // unifico espais
    .trim()                           // neteja espais inici i final
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};


// ====================== FUNCIÓ PRINCIPAL ============================//
async function importData() {
  try {
    let raw = fs.readFileSync(CSV_PATH, 'utf8');

    raw = raw.replace(/""/g, '"'); //netejo les cometes dobles dels camps
    raw = raw
      .split(/\r?\n/)                           //separo les linies
      .map(line => line.replace(/^"|"$/g, '')) //elimino les cometes de la fila
      .join('\n');

    // parsseig -> records = array d'objectes per files
    const records = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      quote: '"',
      relax_quotes: true
    });

    console.log(` ${records.length} Registres llegits.`);
    await Equipment.deleteMany({});
    console.log('Buidat de colecció');

    const equipments = records.map(r => ({ //amb el .map passo cada registre al format q m'interesa (bd)
      name: r.nom?.trim() || '',
      type: normalizeText(r.tipus),
      address: r.localitzacio?.trim() || '',
      latitude: parseFloat(r.latitud) || null,
      longitude: parseFloat(r.longitud) || null,
      description: '',
      schedule: r.horari?.trim() || '',
      phone: r.telefon?.trim() || '',
      district: normalizeText(r.districte),
      isMunicipal: r.municipal?.trim() === 'Sí',
      code: r.CODI_ENS?.trim() || '',
      entity: r.NOM_ENS?.trim() || ''
    }));

    // només guardo els equipments q tinguin nom
    const validEquipments = equipments.filter(e => e.name !== '');

    await Equipment.insertMany(validEquipments);
    console.log(` ${validEquipments.length} registres importats correctament.`);
  
  } catch (err) {
    console.error(' Error important :', err);
  } finally {
    await mongoose.disconnect();
    console.log(' Conexió tancada.');
  }
}

importData();