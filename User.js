
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ['viewer','editor','admin'], default: 'viewer' }
})

module.exports = mongoose.model('User', UserSchema)
