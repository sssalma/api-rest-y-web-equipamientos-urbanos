
//Lògica autiencticació + dades usuari + valoracions



const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');



//cada usuari tindrà un esquema rating per cada rating q faci
const ratingSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    required: true
  },
  equipmentName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Proporciona un email'
  },
  name: {
    type: String,
    required: 'Proporciona un nombre',
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  ratings: [ratingSchema]  //Array de valoracions
}, {
  timestamps: true
});

userSchema.plugin(passportLocalMongoose, { 
  usernameField: 'email',}
);

module.exports = mongoose.model('User', userSchema);