var mongoose = require('mongoose');

var AssetSchema   = new mongoose.Schema({
  name: String,
  url: { type: String, default: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150' }
});

module.exports = mongoose.model('Asset', AssetSchema);