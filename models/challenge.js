var mongoose = require('mongoose');

var ChallengeSchema   = new mongoose.Schema({
  name: String,
  description: String,
  categories: [String],
  schema: String,
  locals: [{ type: mongoose.Schema.ObjectId, ref: 'LocalChallenge' }],
});

module.exports = mongoose.model('Challenge', ChallengeSchema);