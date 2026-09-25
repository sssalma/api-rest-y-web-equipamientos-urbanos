/**
 * CONTROLADOR DE EQUIPAMENTS - Lògica de la API
 * 
 *Implementació de les funcionalitats CRUD
 */

//importo el model 
const Equipment = require('../models/Equipment');



// Busco tots els equipaments i
// si es pasa un type filtra per tipus
exports.getAllEquipments = async (req, res) => {
  try {
    // Miro si ve un tipus a la query (type)
    const tipus = req.query.type;
    let filtre={};
    if (tipus){
      filtre = {type:tipus};
    }
    // busco els equipaments filtrats (o no) a la bd i la retorno
    const equipments = await Equipment.find(filtre);
    res.json(equipments);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//busco per ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipamiento no encontrado' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//metodes que requereixen de credencials : crud


// creació d'un nou equipment
exports.createEquipment = async (req, res) => {
  try {
    // Camps que són obligatoris
    const requiredFields = ['name', 'type', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    // Si falten camps, aviso
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Falten camps obligatoris',
        missing: missingFields
      });
    }

    // Creo el nou equipament amb les dades que em passen
    const equipment = new Equipment(req.body);
    await equipment.save();
    
    console.log(`Equipament creat: ${equipment.name}`);
    res.status(201).json({
      message: 'Equipament creat correctament',
      equipment: equipment
    });
    
  } catch (error) {
    console.error('Error creant equipament:', error);
    res.status(400).json({ 
      error: 'Error creant equipament',
      details: error.message 
    });
  }
};
// Actualitza un equipament que ja existeix
exports.updateEquipment = async (req, res) => {
  try {
    // Agafo la id que ve de la url
    const idEquipament = req.params.id;
    // Agafo les dades noves que m'han enviat
    const dadesNoves = req.body;
    
    // Busco l'equipament per la seva id i li poso les dades noves
    const equipment = await Equipment.findByIdAndUpdate(
      idEquipament, 
      dadesNoves,
      { 
        new: true  // Perquè em torni l'equipament amb les dades noves
      }
    );
    // Si NOT FOUND cap equipament amb aquesta id
    if (!equipment) {
      return res.status(404).json({ 
        error: 'No  equipment per aqueest id',
        id: idEquipament
      });
    }
    // Si tot va bé, mostro per consola i torno l'equipament actualitzat
    console.log(`S'ha actualitzat l'equipament: ${equipment.name}`);
    res.json({
      message: 'Equipament actualitzat bé',
      equipment: equipment
    });
    
  } catch (error) {
    // Si algo falla, mostro l'error i torno un missatge
    console.error('Hi ha hagut un error actualitzant:', error);
    res.status(400).json({ 
      error: 'No s ha actualitzar',
      details: error.message 
    });
  }
};

// Elimina un equipament
exports.deleteEquipment = async (req, res) => {
  try {
    // Busco l'equipament pel ID i l'elimino
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    
    // Si no el trobo, aviso
    if (!equipment) {
      return res.status(404).json({ 
        error: 'Equipament no trobat',
        id: req.params.id
      });
    }
    
    console.log(`Equipament eliminat: ${equipment.name}`);
    res.json({ 
      message: 'Equipament eliminat correctament',
      deletedEquipment: {
        id: equipment._id,
        name: equipment.name,
        type: equipment.type
      }
    });
    
  } catch (error) {
    console.error('Error eliminant equipament:', error);
    res.status(500).json({ 
      error: 'Error eliminant equipament',
      details: error.message 
    });
  }
};