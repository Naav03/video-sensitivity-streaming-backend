
const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema({
  filename: String,
  owner: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ['processing','safe','flagged'], default: 'processing' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Video', VideoSchema)
