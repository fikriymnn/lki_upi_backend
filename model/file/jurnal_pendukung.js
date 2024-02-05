const mongoose = require('mongoose')


const jurnal_pendukung_schema = new mongoose.Schema({
   jurnal_pendukung:  {
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

module.exports =  mongoose.model("Jurnal_pendukung",jurnal_pendukung_schema)