

const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../controllers/authController');
const User = require('../models/User');

// Afegir/actualitzar valoració.  --Cal autenticació (isloggedin)
router.post('/equipments/:id/rate', isLoggedIn, async (req, res) => {
  try {

     // Busco l’usuari que està loguejat i comprovo si ha valorat l'equipament
    const { rating, comment } = req.body;
    const equipmentId = req.params.id;
    const equipmentName = req.body.equipmentName || 'Equipamiento';
    
    const user = await User.findById(req.user._id);
    const existingRating = user.ratings.find(r => r.equipmentId === equipmentId);
    
    if (existingRating) {//si existeix una valoració l'actualitzo
      await User.findOneAndUpdate(
        { _id: req.user._id, 'ratings.equipmentId': equipmentId },
        {
          $set: {
            'ratings.$.rating': parseInt(rating),
            'ratings.$.comment': comment,
            'ratings.$.createdAt': new Date()
          }
        }
      );
      req.flash('success', '¡Valoración actualizada correctamente!');
    }
    
    else {
      //si no existeix creo una nova valoració
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          ratings: {
            equipmentId: equipmentId,
            equipmentName: equipmentName,
            rating: parseInt(rating),
            comment: comment,
            createdAt: new Date()
          }
        }
      });
      req.flash('success', '¡Valoración añadida correctamente!');
    }
    
    res.redirect(`/equipments/${equipmentId}`);
    
  } catch (error) {
    console.error('Error guardando valoración:', error);
    req.flash('error', 'Error al guardar la valoración');
    res.redirect(`/equipments/${req.params.id}`);
  }
});

// Eliminar valoració (POST pq treballo amb html form)  --Cal autenticació (isloggedin)
router.post('/equipments/:equipmentId/rate/delete', isLoggedIn, async (req, res) => {
  try {
    const equipmentId = req.params.equipmentId;
    
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        ratings: { equipmentId: equipmentId }
      }
    });
    
    req.flash('success', 'Valoración eliminada correctamente');
    res.redirect(`/equipments/${equipmentId}`);
    
  } catch (error) {
    console.error('Error eliminando valoración:', error);
    req.flash('error', 'Error al eliminar la valoración');
    res.redirect(`/equipments/${req.params.equipmentId}`);
  }
});

module.exports = router;