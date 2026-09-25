const { getGlobalRanking, getPersonalRanking } = require('../services/ratingService');

// mostro la pàgina de rankings
exports.showRankings = async (req, res) => {
  try {
    
    const globalRanking = await getGlobalRanking();
    let personalRanking = [];
    
    if (req.user) {
      personalRanking = await getPersonalRanking(req.user._id);
    }
    
    res.render('rankings', {
      title: '🏆 Rankings',
      globalRanking: globalRanking,
      personalRanking: personalRanking,
      user: req.user
    });
    
  } catch (error) {
    console.error('Error cargando rankings:', error);
    req.flash('error', 'Error al cargar los rankings');
    res.redirect('/');
  }
};