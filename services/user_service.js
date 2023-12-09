const User = require('../model/user_model')
const bcrypt = require('bcrypt')
const { generate_access_token } = require('../utils/jwt')

const user_service = {
    register_service: async (req, res) => {
        try {
            const { password, email, jenis_instansi, nama_instansi, jabatan, no_telp, nama_lengkap } = req.body
            if (!password && !email && !jenis_instansi && !nama_instansi && !jabatan && !no_telp && !nama_lengkap) {
                throw {
                    status: 400,
                    message: "Incomplete input data."
                }
            }
            const user_exist = await User.find({ email })
            if (user_exist) {
                throw {
                    status: 400,
                    message: "User was exist."
                }
            }
            const hash_password = await bcrypt.hash(password, 10)
            const new_user = new User({ email, password: hash_password, nama_lengkap, nama_instansi, jabatan, jenis_instansi, no_telp })
            await new_user.save()

            const user = await User.findOne({ email })
            const access_token = generate_access_token({ _id: user._id, email, role: user.role, jenis_instansi, nama_instansi, jabatan, no_telp, nama_lengkap })

            res.cookie("access_token", access_token, {
                httpOnly: true,
                path: "/"
            })

            return {
                _id: user._id,
                email,
                nama_lengkap,
                nama_instansi,
                jabatan,
                no_telp, role: "user"
            }
        } catch (err) {
            throw {
                status: 500,
                message: err.message
            }
        }

    },
    login_service: async (req, res) => {
        try {
            const { password, email } = req.body
            if (!password && !email) {
                throw {
                    status: 400,
                    message: "Incomplete input data."
                }
            }

            const user_exist = await User.findOne({ email })
            if (!user_exist) {
                throw {
                    status: 400,
                    message: "User is not exist."
                }
            }
            const compare = await bcrypt.compare(password, user_exist.password)
            if (!compare) {
                throw {
                    status: 400,
                    message: "Wrong password."
                }
            }
            const access_token = generate_access_token({
                _id: user_exist._id,
                email, jenis_instansi: user_exist.jenis_instansi, nama_instansi: user_exist.nama_instansi, jabatan: user_exist.jabatan, no_telp: user_exist.no_telp, nama_lengkap: user_exist.nama_lengkap, role: user_exist.role
            })
            res.cookie('access_token', access_token, {
                httpOnly: true,
                path: "/"
            })

            return {
                _id: user_exist._id,
                email, jenis_instansi: user_exist.jenis_instansi, nama_instansi: user_exist.nama_instansi, jabatan: user_exist.jabatan, no_telp: user_exist.no_telp, nama_lengkap: user_exist.nama_lengkap, role: user_exist.role
            }

        } catch (err) {
            throw {
                status: 500,
                message: err.message
            }
        }
    },
    get_user_service: async (req) => {
       try{
        const data = req.user
        return data
       }catch(err){
        throw {
            status: 500,
            message: err.message
        }
       }
    },
    logout_service: async (res) => {
       try{
        res.clearCookie('access_token')
        return 'Logout success.'
       }catch(err){
        throw {
            status: 500,
            message: err.message
        }
       }
    }
}

module.exports = user_service