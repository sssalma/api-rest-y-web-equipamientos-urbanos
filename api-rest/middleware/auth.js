/**
 * MIDDLEWARE D AUTENTICACIÓ per protegir els endpoints crud amb API KEY
 * 
 * Verifica que las peticions a adreces protegides tinguin
 * 'x-api-key'vàlida al header.
 */

const apiAuth = (req, res, next) => {
const apiKey = req.headers['x-api-key'];
 if (!apiKey) { //si no s'ha proporcionat al header
    return res.status(401).json({ 
      error: 'x-api-key requerida al header, no tens permisos.'
    });
  }
  //si sha proporcionat pero es diferent a la de .env
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ 
      error: 'API Key invàlida'
    });
  }
  
  console.log('Petició autoritzada desde lAPI');
  next(); //continuo amb el següent middleware
};
module.exports = { apiAuth };