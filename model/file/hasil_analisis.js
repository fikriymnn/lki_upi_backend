const mongoose = require('mongoose')


const hasil_analisis_schema = new mongoose.Schema({
   hasil_analsis:  {
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