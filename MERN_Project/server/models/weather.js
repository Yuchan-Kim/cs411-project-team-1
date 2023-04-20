const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Weather', weatherSchema);
