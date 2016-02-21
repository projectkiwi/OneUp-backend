var mongoose = require('mongoose');

var ChallengeGroupSchema   = new mongoose.Schema({
  name: String,
  locals: [{ type: mongoose.Schema.ObjectId, ref: 'LocalChallenge' }],
});

module.exports = mongoose.model('ChallengeGroup', ChallengeGroupSchema);