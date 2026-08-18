const mongoose = require('mongoose')

const AFFILIATE_ROLES = ['laboran', 'ketua_lab']

const user_schema = new mongoose.Schema({
    nama_lengkap: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    no_telp: {
        type: String,
        required: function () {
            return !AFFILIATE_ROLES.includes(this.role)
        }
    },
    no_whatsapp: {
        type: String,
        required: true
    },
    jenis_institusi: {
        type: String,
        required: function () {
            return !AFFILIATE_ROLES.includes(this.role)
        }
    },
    nama_institusi: {
        type: String,
    },
    program_studi: {
        type: String
    },
    fakultas: {
        type: String
    },
    role: {
        type: String,
        default: "user"
    },
    id_affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabAffiliate",
        required: function () {
            return AFFILIATE_ROLES.includes(this.role)
        }
    },
    status: {
        type: String,
        default: "aktif"
    },
    reset_password_token: {
        type: String,
        default: null
    },
    reset_password_expires: {
        type: Date,
        default: null
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("User", user_schema)