var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var ChallengeSchema = new mongoose.Schema({
  name: String,
  attempts : [{ type: mongoose.Schema.ObjectId, ref: 'Attempt' }],
  location: { type: mongoose.Schema.ObjectId, ref: 'Location' },
  user_likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  description: String,
  pattern: String,
  categories: [String],
  created_on: { type: Date },
  updated_on: { type: Date },
  expires_at: { type: Date, default: Date.now },
  challenge_likes: { type: Number, default: 0 },
  liked_top_attempt: Boolean,
  liked_previous_attempt: Boolean,
  bookmarked_challenge: Boolean
});

ChallengeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Challenge', ChallengeSchema);