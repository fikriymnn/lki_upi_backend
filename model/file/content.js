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
    type: String
   },
   contoh_hasil:{
   type: String
   }
},
{timestamps:true}
)

module.exports =  mongoose.model("Content",content_schema)