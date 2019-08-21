const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchama = new Schema(
  {
    email: { type: String, require: true },
    username: { type: String, require: true },
    password: { type: String, require: true },
    avator: String,
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    gender: { type: Number, require: true }, // 1 as male 0 as female
    birthday: { type: String, require: true },
    height: { type: Number, require: true },
    weight: { type: Number, require: true },
    notificationEnabled: { type: Boolean, require: true, default: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('User', UserSchama);
