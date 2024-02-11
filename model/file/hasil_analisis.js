const mongoose = require('mongoose')


const hasil_analisis_schema = new mongoose.Schema({
   hasil_analisis:  {
    data:Buffer,
    contentType:String,
    originalName:String
   },
   uuid: {
    type: String
   }
},
{timestamps:true}
)

module.exports =  mongoose.model("Hasil_analisis",hasil_analisis_schema)