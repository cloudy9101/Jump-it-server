const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DietSchema = new Schema(
  {
    userId: { type: String, require: true },
    name: { type: String, require: true },
    value: { type: String, require: true }
  },
  { versionKey: false }
)

module.exports = mongoose.model('Diet', DietSchema);
