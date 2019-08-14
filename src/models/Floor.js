const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FloorSchema = new Schema(
  {
    userId: { type: String, require: true },
    value: { type: Number, require: true },
    startDate: { type: String, require: true },
    endDate: { type: String, require: true },
    date: { type: String, require: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('Floor', FloorSchema);
