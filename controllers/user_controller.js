const User = require('../model/user_model')
const bcrypt = require('bcrypt')
const { generate_access_token } = require('../utils/jwt')

const user_controller = {
   register: async (req, res) => {
      try {
         const { password, email, jenis_institusi, nama_institusi, no_telp, nama_lengkap } = req.body
         if (!password && !email && !nama_institusi && !no_telp && !nama_lengkap && !jenis_institusi) {
            throw {
               status: 400,
               message: "Incomplete input data."
            }
         }
         const user_exist = await User.findOne({ email })
         if (user_exist) {
            throw {
               status: 400,
               message: "User was exist."
            }
         }
         const hash_password = await bcrypt.hash(password, 10)
         const new_user = new User({ email, password: hash_password, nama_lengkap, nama_institusi, jenis_institusi, no_telp })
         await new_user.save()

         const user = await User.findOne({ email })
         const access_token = generate_access_token({ _id: user._id, email, role: user.role, jenis_institusi, nama_institusi, no_telp, nama_lengkap })

         res.cookie("access_token", access_token, {
            httpOnly: true,
            path: "/"
         })

         res.status(200).json({
            success: true,
            data: {
               _id: user._id,
               email,
               nama_lengkap,
               jenis_institusi,
               nama_institusi,
               no_telp, role: "user"
            }
         })


      } catch (err) {
         res.status(500).json({
            success: false,
            message: err.message
         })
      }

   },
   login: async (req, res) => {
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
            email, jenis_institusi: user_exist.jenis_institusi, nama_institusi: user_exist.nama_institusi, jabatan: user_exist.jabatan, no_telp: user_exist.no_telp, nama_lengkap: user_exist.nama_lengkap, role: user_exist.role
         })
         res.cookie('access_token', access_token, {
            httpOnly: true,
            path: "/"
         })


         res.status(200).json({
            success: true,
            data: {
               _id: user_exist._id,
               email, jenis_institusi: user_exist.jenis_institusi, nama_institusi: user_exist.nama_institusi, jabatan: user_exist.jabatan, no_telp: user_exist.no_telp, nama_lengkap: user_exist.nama_lengkap, role: user_exist.role
            }
         })
      } catch (err) {
         res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   get_user: async (req) => {
      try {
         const data = req.user
         res.status(200).json({
            success: true,
            data
         })
      } catch (err) {
         res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   logout: async (res) => {
      try {
         res.clearCookie('access_token')
         res.status(200).json({
            success: true,
            message: "Logout successfully!"
         })
      } catch (err) {
         res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = user_controller