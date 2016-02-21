var mongoose = require('mongoose');

var CommentSchema   = new mongoose.Schema({
  comment: String,
  test  : { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Comment', CommentSchema);