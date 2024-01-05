const User = require('../model/user_model')
const bcrypt = require('bcrypt')
const { generate_access_token } = require('../utils/jwt')

const user_controller = {
   register: async (req, res) => {
      try {
         const body = req.body
         console.log(body)
        
         const user_exist = await User.findOne({ email: body.email })
         if (user_exist) {
            console.log(0)
            return res.status(400).json({
               status: 400,
               message: "User was exist."
            })
         }
         console.log(1)
         const hash_password = await bcrypt.hash(body.password, 10)
         const new_user = new User({ 
            email:body.email,
            password: hash_password,
            nama_lengkap: body.nama_lengkap, 
            nama_institusi: body.nama_institusi,
            jenis_institusi: body.jenis_institusi,
             no_telp: body.no_telp,
              no_whatsapp:body.no_whatsapp,
              program_studi:body.program_studi,
              fakultas:body.fakultas})
         await new_user.save()
         console.log(2)
         const user = await User.findOne({ email:body.email })
         const access_token = generate_access_token({ _id: user._id, email: body.email, role: user.role, jenis_institusi: body.jenis_institusi, nama_institusi: body.nama_institusi, no_telp: body.no_telp, nama_lengkap: body.nama_lengkap })
         console.log(3)
         res.cookie("access_token", access_token, {
            httpOnly: true,
         })
         console.log(4)
         res.status(200).json({
            success: true,
            data: {
               _id: user._id, email: body.email, role: user.role, jenis_institusi: body.jenis_institusi, nama_institusi: body.nama_institusi, no_telp: body.no_telp, nama_lengkap: body.nama_lengkap
            }
         })
         return 

      } catch (err) {
         console.log(err.message)
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }

   },
   login: async (req, res) => {
      try {
         console.log(0)
         if (req.cookies.access_token) {
            return res.status(200).json({
                status: 200,
                message: "Login successfully"
             })
          }
         const { password, email } = req.body
         if (!password && !email) {
           return res.status(400).json({
               status: 400,
               message: "Incomplete input data."
            })
         }
         console.log(1)

         const user = await User.findOne({ email })
         console.log(2)
         if (!user) {
            return res.status(400).json({
               status: 400,
               message: "User is not exist."
            })
         }
         console.log(3)
         const compare = await bcrypt.compare(password, user.password)
         if (!compare) {
            return res.status(400).json({
               status: 400,
               message: "Wrong password."
            })
         }
         console.log(4)
         const access_token = generate_access_token({
            _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap
         })
         res.cookie('access_token', access_token, {
            httpOnly: true,
            path: "/"
         })

         console.log(5)
         return res.status(200).json({
            success: true,
            data: {
               _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap
            }
         })
      } catch (err) {
         console.log(err.message)
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   get_user: async (req,res) => {
      try {
         console.log(req.cookies)
         const data = req.user
         if(!data){
            res.status(200).json({
               success: false,
               data: "user is not exist"
            })
         }else{
            return res.status(200).json({
               success: true,
               data
            })
         }
         
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   logout: async (req,res) => {
      try {
         if(!req.cookies.access_token){
            return res.status(200).json({
               success: false,
               message: "Logout failed!"
            })
         }
         res.clearCookie('access_token')

         return res.status(200).json({
            success: true,
            message: "Logout successfully!"
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   update_user: async(req,res)=>{
      try{
         const body = req.body
         const _id = req.params
         await User.updateOne({_id},body)
         return res.status(200).json({
            success: true,
            data: "Update user successfully"
         })

      }catch(err){
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = user_controller