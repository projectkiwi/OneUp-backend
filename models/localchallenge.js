var mongoose = require('mongoose');

var LocalChallengeSchema   = new mongoose.Schema({
  name: String,
  challenge: parent  : { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
  attempts  : [{ type: mongoose.Schema.ObjectId, ref: 'Attempt' }],
  location : { type: mongoose.Schema.ObjectId, ref: 'Location' }
});

module.exports = mongoose.model('LocalChallenge', LocalChallengeSchema);