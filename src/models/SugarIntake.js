const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SugarIntakeSchema = new Schema(
  {
    userId: { type: String, require: true },
    value: { type: String, require: true },
    date: { type: Date, require: true }
  },
  { versionKey: false }
);
module.exports = mongoose.model('SugarIntake', SugarIntakeSchema);
