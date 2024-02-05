const mongoose = require('mongoose')


const foto_sample_schema = new mongoose.Schema({
   foto_sample:  {
    data:Buffer,
    contentType:String,
    originalName:String
   },
   uuid: {
    type: String
   },
},
{timestamps:true}
)

module.exports =  mongoose.model("Foto_sample",foto_sample_schema)