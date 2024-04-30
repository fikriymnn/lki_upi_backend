const User = require('../model/user_model')
const bcrypt = require('bcrypt')
const { generate_access_token } = require('../utils/jwt')

const user_controller = {
   register: async (req, res) => {
      try {
         const body = req.body

        
         const user_exist = await User.findOne({ email: body.email })
         if (user_exist) {
            console.log(0)
           return res.status(200).json({
               status: 400,
               message: "Email telah digunakan."
            })
         }
 
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

         const user = await User.findOne({ email:body.email })
         const access_token = generate_access_token({ _id: user._id, email: body.email, role: user.role, jenis_institusi: body.jenis_institusi, nama_institusi: body.nama_institusi, no_telp: body.no_telp, no_whatsapp: user.no_whatsapp,nama_lengkap: body.nama_lengkap })

         res.cookie("access_token", access_token, {
            httpOnly: true,
            path:"/",
            sameSite:'Strict', 
            secure: true,
         })

         return res.status(200).json({
            success: true,
            data: {
               _id: user._id, email: body.email, role: user.role, jenis_institusi: body.jenis_institusi, nama_institusi: body.nama_institusi, no_telp: body.no_telp, nama_lengkap: body.nama_lengkap,no_whatsapp: user.no_whatsapp
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
   login: async (req, res) => {
      try {
         console.log(0)
         if (req.cookies.access_token) {
            return res.status(200).json({
               success:true,
                status: 200,
                message: "Login successfully"
             })
          }
         const { password, email } = req.body
         if (!password && !email) {
           return res.status(200).json({
               status: 400,
               success:false,
               message: "email atau password salah."
            })
         }

         const user = await User.findOne({ email })
         console.log(2)
         if (!user) {
            return res.status(200).json({
               status: 400,
               success:false,
               message: "email tidak ditemukan."
            })
         }

         const compare = await bcrypt.compare(password, user.password)
         if (!compare) {
            return res.status(200).json({
               status: 400,
               success:false,
               message: "password salah."
            })
         }

         const access_token = generate_access_token({
            _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap,no_whatsapp: user.no_whatsapp
         })

         res.cookie('access_token', access_token, {
            httpOnly: true,
            path: "/",
            sameSite:'Strict',
            secure: true,
         })

         return res.status(200).json({
            success: true,
            data: {
               _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap,no_whatsapp: user.no_whatsapp,
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
   getAdmin_user: async (req,res) => {
      try {
        
         const data = await User.findOne({role:'admin'})
         const dataOp = await User.findOne({role:'operator'})
         const dataPj = await User.findOne({role:'pj'})
      
         res.status(200).json({
            success: true,
            data: {
               admin:data,operator:dataOp,pj:dataPj
            }
         })
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
         res.clearCookie('access_token',{ sameSite:'None',
         secure: true,})

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
         const {id} = req.params
         await User.updateOne({_id:id},body)
         const user = await User.findOne({_id:id})
         const access_token = generate_access_token({
            _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap,no_whatsapp: user.no_whatsapp
         })
         res.cookie('access_token', access_token, {
            httpOnly: true,
            path: "/",
            sameSite:'None',
            secure: true,
            
         })
         return res.status(200).json({
            success: true,
            data: 'update successfully'
         })

      }catch(err){
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   edit_user: async(req,res)=>{
      try{
         const body = req.body
         const {password} = req.body
         const {id} = req.params
         if(password){
            const hash_password = await bcrypt.hash(password, 10)
            body.password = hash_password
            await User.updateOne({_id:id},body)
         }else{
            await User.updateOne({_id:id},body)
         }     
         return res.status(200).json({
            success: true,
            data: 'update successfully'
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
