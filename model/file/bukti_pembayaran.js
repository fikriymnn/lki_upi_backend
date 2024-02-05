const mongoose = require('mongoose')


const bukti_pembayaran_schema = new mongoose.Schema({
   bukti_pembayaran:  {
    data:Buffer,
    contentType:String,
    originalName:String
   },
   id_invoice: {
    type: String
   },
},
{timestamps:true}
)

module.exports =  mongoose.model("Bukti_pembayaran",bukti_pembayaran_schema)