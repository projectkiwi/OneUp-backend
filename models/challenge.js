var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var ChallengeSchema   = new mongoose.Schema({
  name: String,
  attempts : [{ type: mongoose.Schema.ObjectId, ref: 'Attempt' }],
  location: { type: mongoose.Schema.ObjectId, ref: 'Location' },
  description: { type: String, default: 'Description Place Holder' },
  categories: [String],
  pattern: String,
  vote_total: { type: Number, default: 0 } // Will be calculated field
});

ChallengeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Challenge', ChallengeSchema);