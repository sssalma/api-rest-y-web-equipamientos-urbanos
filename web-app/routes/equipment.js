const express = require('express');
const axios = require('axios');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../controllers/authController');
const { getEquipmentRatings, getUserRating, getAllEquipmentRatings } = require('../services/ratingService');

// Listar todos los equipamientos
router.get('/', async (req, res) => {
  try {
    
    // 1. Obtener equipamientos de la API
    const response = await axios.get(`${process.env.API_BASE_URL}/equipments`);
    let equipments = response.data;
    
    // 2. Obtener tipos únicos
    const types = [...new Set(equipments.map(eq => eq.type))].sort();
    
    // 3. Obtener distritos únicos
    const districts = [...new Set(equipments.map(eq => eq.district).filter(Boolean))].sort();
    
    // 4. Obtener todas las valoraciones
    const allRatings = await getAllEquipmentRatings();
    
    // 5. Asignar valoraciones a cada equipamiento
    equipments = equipments.map(equipment => {
      const ratingData = allRatings[equipment._id] || { averageRating: 0, count: 0 };
      return {
        ...equipment,
        averageRating: ratingData.averageRating || 0,
        totalRatings: ratingData.count || 0
      };
    });
    
    
    res.render('equipments', { 
      title: 'Equipamientos',
      equipments: equipments,
      types: types,
      districts: districts,
      user: req.user
    });
    
  } catch (error) {
    console.error('Error obteniendo equipamientos:', error.message);
    
    res.render('equipments', { 
      title: 'Equipamientos',
      equipments: [],
      types: [],
      districts: [],
      user: req.user
    });
  }
});

// Formulario para añadir equipamiento (solo admin)
router.get('/new', isLoggedIn, isAdmin, (req, res) => {
  res.render('equipment-form', {
    title: 'Añadir Equipamiento',
    equipment: {},
    action: '/equipments'
  });
});

// Procesar formulario nuevo equipamiento (solo admin)
router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const response = await axios.post(`${process.env.API_BASE_URL}/equipments`, req.body, {
      headers: {
        'x-api-key': process.env.API_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    req.flash('success', 'Equipamiento creado correctamente');
    res.redirect('/equipments');
    
  } catch (error) {
    console.error('Error creando equipamiento:', error.message);
    req.flash('error', 'Error al crear el equipamiento');
    res.redirect('/equipments/new');
  }
});

// Formulario editar equipamiento (solo admin)
router.get('/:id/edit', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/equipments/${req.params.id}`);
    
    res.render('equipment-form', {
      title: 'Editar Equipamiento',
      equipment: response.data,
      action: `/equipments/${req.params.id}?_method=PUT`
    });
    
  } catch (error) {
    req.flash('error', 'Equipamiento no encontrado');
    res.redirect('/equipments');
  }
});

// Procesar edición equipamiento (solo admin)
router.put('/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    await axios.put(`${process.env.API_BASE_URL}/equipments/${req.params.id}`, req.body, {
      headers: {
        'x-api-key': process.env.API_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    req.flash('success', 'Equipamiento actualizado correctamente');
    res.redirect('/equipments');
    
  } catch (error) {
    req.flash('error', 'Error al actualizar el equipamiento');
    res.redirect(`/equipments/${req.params.id}/edit`);
  }
});

// Eliminar equipamiento (solo admin)
router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    await axios.delete(`${process.env.API_BASE_URL}/equipments/${req.params.id}`, {
      headers: {
        'x-api-key': process.env.API_SECRET_KEY
      }
    });
    
    req.flash('success', 'Equipamiento eliminado correctamente');
    res.redirect('/equipments');
    
  } catch (error) {
    req.flash('error', 'Error al eliminar el equipamiento');
    res.redirect('/equipments');
  }
});

// Mostrar detalle de equipamiento
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/equipments/${req.params.id}`);
    const equipment = response.data;
    
    // Obtener valoraciones
    const ratingData = await getEquipmentRatings(req.params.id);
    
    // Si está logueado, obtener su valoración
    let userRating = null;
    if (req.user) {
      userRating = await getUserRating(req.user._id, req.params.id);
    }
    
    res.render('equipment-detail', {
      title: equipment.name,
      equipment: equipment,
      user: req.user,
      ratingData: ratingData,
      userRating: userRating
    });
    
  } catch (error) {
    console.error('Error obteniendo equipamiento:', error.message);
    req.flash('error', 'Equipamiento no encontrado');
    res.redirect('/equipments');
  }
});

module.exports = router;