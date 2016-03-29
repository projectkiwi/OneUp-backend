var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
	name: String,
	place_id: String, //reference to facebook places API id
	location : {
		type: { 
		  type: String,
		  default: 'Point'
		}, 
		coordinates: [Number]
	}	
});

LocationSchema.index({ location : '2dsphere' });
module.exports = mongoose.model('Location', LocationSchema);