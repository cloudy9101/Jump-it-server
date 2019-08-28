const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodSchema = new Schema(
  {
    userId: { type: String, require: true },
    name: { type: String, require: true },
    value: { type: Number, require: true },
    imgUri: { type: String, require: false },
    imgIndex: { type: Number, require: false  }
  },
  { versionKey: false }
)

module.exports = mongoose.model('Food', FoodSchema);
