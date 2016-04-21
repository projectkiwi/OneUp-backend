var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
  text: String,
  from: { type: mongoose.Schema.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.ObjectId, ref: 'User' },
  challenge: { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);