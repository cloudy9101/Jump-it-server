const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FloorSchema = new Schema(
  {
    userId: { type: String, require: true },
    value: { type: Number, require: true },
    startDate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    date: { type: Date, require: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('Floor', FloorSchema);
