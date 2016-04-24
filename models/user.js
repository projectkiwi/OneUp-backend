var mongoose = require('mongoose');
var crypto = require('crypto');

var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
  };


var UserSchema = new mongoose.Schema({
  username: String,
  facebook_id: String,
  email: String,
  settings: [String],
  bookmarks: [{ type: mongoose.Schema.ObjectId, ref: 'Challenge' }],
  associated_challenges: [{ type: mongoose.Schema.ObjectId, ref: 'Challenge' }],
  records: [{ type: mongoose.Schema.ObjectId, ref: 'Challenge' }],
  liked_challenges: [{ type: mongoose.Schema.ObjectId, ref: 'Challenge' }]
},schemaOptions);

UserSchema.virtual('avatar')
.get(function () {
	var hash = crypto.createHash('md5').update(this.email+"aa").digest('hex');
	return "http://www.gravatar.com/avatar/"+hash+"?s=64&d=identicon&r=PG";
});


module.exports = mongoose.model('User', UserSchema);