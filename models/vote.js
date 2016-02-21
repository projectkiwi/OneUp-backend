var mongoose = require('mongoose');

var VoteSchema   = new mongoose.Schema({
  vote: Number,
  user  : { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Vote', VoteSchema);