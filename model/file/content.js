const mongoose = require('mongoose')


const content_schema = new mongoose.Schema({
    
   title:{
    type:String
   },
   sub_title:{
    type:String
   },
   deskripsi:{
    type:String
   },
    foto:{
    data:Buffer,
    contentType:String,
    originalName:String
   },
   contoh_hasil:[{
    data:Buffer,
    contentType:String,
    originalName:String
   }]
},
{timestamps:true}
)

module.exports =  mongoose.model("Content",content_schema)