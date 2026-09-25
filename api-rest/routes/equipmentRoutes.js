



const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { apiAuth } = require('../middleware/auth');

//endpoints
router.get('/', equipmentController.getAllEquipments);
router.get('/:id', equipmentController.getEquipmentById);

//endpoints que requereixen d'autenticacio: POST,PUT, DELETE
router.post('/', apiAuth, equipmentController.createEquipment);
router.put('/:id', apiAuth, equipmentController.updateEquipment);
router.delete('/:id', apiAuth, equipmentController.deleteEquipment);


module.exports = router;