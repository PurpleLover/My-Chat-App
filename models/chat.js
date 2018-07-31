const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  username: String,
  message: String,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', chatSchema);