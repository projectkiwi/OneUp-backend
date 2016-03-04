var mongoose = require('mongoose');

var ChallengeSchema   = new mongoose.Schema({
  name: String,
  attempts  : [{ type: mongoose.Schema.ObjectId, ref: 'Attempt' }],
  location : { type: mongoose.Schema.ObjectId, ref: 'Location' },
  description: {type: String, default: "description"},
  categories: [String],
  pattern: String,
});

module.exports = mongoose.model('Challenge', ChallengeSchema);