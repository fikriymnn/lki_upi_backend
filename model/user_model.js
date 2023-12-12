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
    jenis_instansi : {
        type:String,
        required:true
    },
    nama_instansi : {
        type:String,
        required:true
    },
    jabatan: {
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    }
},
{timestamps:true}
)

module.export =  mongoose.model("User",user_schema)