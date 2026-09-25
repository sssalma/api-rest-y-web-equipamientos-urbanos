const User = require('../models/User');

// Obtener todas las valoraciones de todos los equipamientos
exports.getAllEquipmentRatings = async () => {
  try {
    const allUsers = await User.find({}, 'ratings').lean();
    const allRatings = allUsers.flatMap(user => user.ratings || []);
    
    // Agrupar ratings por equipmentId
    const ratingsByEquipment = {};
    
    allRatings.forEach(rating => {
      if (!ratingsByEquipment[rating.equipmentId]) {
        ratingsByEquipment[rating.equipmentId] = {
          totalRating: 0,
          count: 0
        };  
      }
      
      ratingsByEquipment[rating.equipmentId].totalRating += rating.rating;
      ratingsByEquipment[rating.equipmentId].count += 1;
    });
    
    // Calcular promedio
    Object.keys(ratingsByEquipment).forEach(equipmentId => {
      const data = ratingsByEquipment[equipmentId];
      data.averageRating = data.totalRating / data.count;
    });
    
    return ratingsByEquipment;
    
  } catch (error) {
    console.error('Error obteniendo todos los ratings:', error);
    return {};
  }
};

// Obtener valoraciones de un equipamiento específico
exports.getEquipmentRatings = async (equipmentId) => {
  try {
    const usersWithRatings = await User.find({
      'ratings.equipmentId': equipmentId
    }).lean();
    
    const allRatings = usersWithRatings.flatMap(user => 
      (user.ratings || []).filter(r => r.equipmentId === equipmentId)
    );
    
    if (allRatings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratings: []
      };
    }
    
    const totalScore = allRatings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = (totalScore / allRatings.length).toFixed(1);
    
    return {
      averageRating: parseFloat(averageRating),
      totalRatings: allRatings.length,
      ratings: allRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  } catch (error) {
    console.error('Error en getEquipmentRatings:', error);
    return {
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    };
  }
};

// Obtener valoración de un usuario específico
exports.getUserRating = async (userId, equipmentId) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) return null;
    
    return (user.ratings || []).find(r => r.equipmentId === equipmentId) || null;
  } catch (error) {
    console.error('Error obteniendo valoración del usuario:', error);
    return null;
  }
};

// Ranking global (top 3)
exports.getGlobalRanking = async () => {
  try {
    const allRatings = await this.getAllEquipmentRatings();
    
    const rankings = Object.entries(allRatings)
      .map(([equipmentId, data]) => ({
        equipmentId: equipmentId,
        averageRating: data.averageRating,
        count: data.count
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);
    
    return rankings;
    
  } catch (error) {
    console.error('Error calculando ranking global:', error);
    return [];
  }
};

// Ranking personal (top 3 del usuario)
exports.getPersonalRanking = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    
    if (!user || !user.ratings || user.ratings.length === 0) {
      return [];
    }
    
    const personalRanking = user.ratings
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    return personalRanking;
    
  } catch (error) {
    console.error('Error calculando ranking personal:', error);
    return [];
  }
};

// Añadir o actualizar valoración
exports.addOrUpdateRating = async (userId, equipmentId, rating, comment = '') => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Buscar si ya existe una valoración
    const existingRatingIndex = user.ratings.findIndex(
      r => r.equipmentId.toString() === equipmentId
    );
    
    const ratingData = {
      equipmentId: equipmentId,
      rating: rating,
      comment: comment,
      createdAt: new Date()
    };
    
    if (existingRatingIndex >= 0) {
      // Actualizar valoración existente
      user.ratings[existingRatingIndex] = ratingData;
    } else {
      // Añadir nueva valoración
      user.ratings.push(ratingData);
    }
    
    await user.save();
    return ratingData;
    
  } catch (error) {
    console.error('Error añadiendo/actualizando valoración:', error);
    throw error;
  }
};