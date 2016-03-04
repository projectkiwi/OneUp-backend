var mongoose = require('mongoose');

var VoteSchema   = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Vote', VoteSchema);