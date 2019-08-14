const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HighBloodSchema = new Schema(
  {
    userId: { type: String, require: true },
    low: { type: String, require: true },
    high: { type: String, require: true },
    timestamp: { type: String, require: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('HighBlood', HighBloodSchema);