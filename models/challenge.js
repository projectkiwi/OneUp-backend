var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var ChallengeSchema = new mongoose.Schema({
  name: String,
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  attempts: [{ type: mongoose.Schema.ObjectId, ref: 'Attempt' }],
  location: { type: mongoose.Schema.ObjectId, ref: 'Location' },
  user_likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  user_bookmarks: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  user_associated: [{ type: mongoose.Schema.ObjectId, ref: 'User '}],
  description: String,
  type: String,
  quantifier: String,
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
ChallengeSchema.plugin(deepPopulate);

module.exports = mongoose.model('Challenge', ChallengeSchema);