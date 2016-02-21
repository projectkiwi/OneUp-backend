var mongoose = require('mongoose');

var AssetSchema   = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Asset', AssetSchema);