var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var ChallengeSchema = new mongoose.Schema({
  name: String,
  attempts : [{ type: mongoose.Schema.ObjectId, ref: 'Attempt' }],
  location: { type: mongoose.Schema.ObjectId, ref: 'Location' },
  description: { type: String, default: 'Description Place Holder' },
  pattern: String,
  categories: [String],
  created_on: { type: Date },
  updated_on: { type: Date },
  expires_at: { type: Date, default: Date.now },
  challenge_likes: { type: Number, default: 0 },
  record_holders: [{ type: mongoose.Schema.ObjectId, ref: 'User'}],
  user_liked: Boolean
});

ChallengeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Challenge', ChallengeSchema);