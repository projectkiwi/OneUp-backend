var mongoose = require('mongoose');

var LocationSchema   = new mongoose.Schema({
  name: String,
  loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
    },
    place_id: String, //reference to facebook places API id
    parent  : { type: mongoose.Schema.ObjectId, ref: 'Location' },
    type: String
});

module.exports = mongoose.model('Location', LocationSchema);