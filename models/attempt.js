var mongoose = require('mongoose');

var AttemptSchema   = new mongoose.Schema({
  score: Number, //probably will make this a calculated field
  challenge  : { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
  user  : { type: mongoose.Schema.ObjectId, ref: 'User' },
  preview_img  : String,
  full_img  : String,
  gif_img : String,
  comments  : [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
  votes  : [{ type: mongoose.Schema.ObjectId, ref: 'Vote' }],
});

module.exports = mongoose.model('Attempt', AttemptSchema);