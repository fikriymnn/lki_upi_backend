const mongoose = require('mongoose')


const user_schema = new mongoose.Schema({
    nama_lengkap: {
       type:String,
       required: true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    no_telp :{
        type:String,
        required:true
    },
    no_whatsapp :{
        type:String,
        required:true
    },
    jenis_institusi : {
        type:String,
        required:true
    },
    nama_institusi : {
        type:String,
    },
    program_studi : {
        type: String
    },
    fakultas: {
        type: String
    },
    role:{
        type:String,
        default:"user"
    }
},
{timestamps:true}
)

module.exports =  mongoose.model("User",user_schema)