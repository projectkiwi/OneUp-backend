var mongoose = require('mongoose');

var AttemptSchema   = new mongoose.Schema({
  challenge : { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
  description: { type: String, default: 'Attempt Description' }, 
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  full_img: String,
  gif_img: String,
  orig_video: String,
  comments: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
  user_likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  like_total: { type: Number, default: 0 },
  created_on: { type: Date, default: Date.now },
  liked_attempt: Boolean
});

module.exports = mongoose.model('Attempt', AttemptSchema);