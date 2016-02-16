// Load required packages
var mongoose = require('mongoose');

// Define our Test schema
var TestSchema   = new mongoose.Schema({
  name: String,
  type: String,
  quantity: Number,
  test  : { type: mongoose.Schema.ObjectId, ref: 'User' }
});

// Export the Mongoose model
module.exports = mongoose.model('Test', TestSchema);