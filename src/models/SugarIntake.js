const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SugarIntakeSchema = new Schema(
  {
    userId: { type: String, require: true },
    value: { type: String, require: true },
    timestamp: { type: String, require: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('SugarIntake', SugarIntakeSchema);
