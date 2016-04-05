var mongoose = require('mongoose');

var UserSchema   = new mongoose.Schema({
  nickname: String,
  facebook_id: String,
  email: String,
  settings: [String],
  bookmarks: [{ type: mongoose.Schema.ObjectId, ref: 'Challenge' }]
});

module.exports = mongoose.model('User', UserSchema);