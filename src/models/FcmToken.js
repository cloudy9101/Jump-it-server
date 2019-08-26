const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FcmTokenSchama = new Schema(
  {
    userId: { type: String, require: true },
    deviceId: { type: String, require: true },
    token: { type: String, require: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('FcmToken', FcmTokenSchama);
