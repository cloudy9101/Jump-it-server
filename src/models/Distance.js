const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DistanceSchema=new Schema(
    {
        userId:{type:String,require:true }
        distance:{type:String,require:true}
        startDate:{type:String,require:true}
        endDate:{type:String,require:true}
        date:{type:String,require:true}
    },  { versionKey: false }
)
module.exports= mongoose.model('Distance', DistanceSchema);