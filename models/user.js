var mongoose = require('mongoose');

var UserSchema   = new mongoose.Schema({
  nickname: String,
  facebook_id: String,
  settings: [String],
  bookmarks  : [{ type: mongoose.Schema.ObjectId, ref: 'LocalChallenge' }]
});

module.exports = mongoose.model('User', UserSchema);