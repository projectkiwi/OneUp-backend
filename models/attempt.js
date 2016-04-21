var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var keys = require('../keys');

var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
  };

var AttemptSchema = new mongoose.Schema({
  challenge : { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
  description: { type: String, default: 'Attempt Description' },
  type: String,
  quantifier: String,
  quantity: String,
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  gif_img: String,
  orig_video: String,
  comments: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
  user_likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  like_total: { type: Number, default: 0 },
  created_on: { type: Date, default: Date.now },
  liked_attempt: Boolean
},schemaOptions);


AttemptSchema.virtual('gif_full_url')
.get(function () {
  return keys.server_url + "/" + this.gif_img;
});

AttemptSchema.plugin(deepPopulate);

module.exports = mongoose.model('Attempt', AttemptSchema);