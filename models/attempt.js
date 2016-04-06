var mongoose = require('mongoose');

var AttemptSchema   = new mongoose.Schema({
  challenge : { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
  description: { type: String, default: 'Attempt Description' }, 
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  preview_img: String,
  full_img: String,
  gif_img: String,
  comments: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  like_total: { type: Number, default: 0 },
  created_on: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', AttemptSchema);