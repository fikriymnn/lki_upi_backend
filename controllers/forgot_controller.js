const Users = require('../model/user_model')
const {generate_access_token} = require('../utils/jwt')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const forgot_controller = {
  send_email: async (req, res) => {
    try{
    const {email} = req.params

    if(!email){
      res.status(400).json({message: "Email tidak valid"})
    }
    
    const data = await Users.findOne({email})
    if(!data){
      res.status(400).json({message: "Email tidak valid"})
    }
    
    const email_encrypt = generate_access_token({email})
    


    const nodemailer = require('nodemailer');

    // Konfigurasi transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lablkiupi@gmail.com',
        pass: 'lablki123'
      }
    });

    // Opsi email
    const mailOptions = {
      from: 'lablkiupi@gmail.com',
      to: email,
      subject: 'Verifikasi Email LKI UPI',
      html: `<a href="http://localhost:3000/lupapassword/${email_encrypt}>Klik Untuk Ubah Password</a>`
    };

    // Kirim email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.status(200).json({message:"success",success:true})
  }catch(err){
    res.status(500).json({message:err.message,success:false})
  }
  },
  verify_token: async (req, res) => {
    try{
        const {token} = req.params
        if(!token){
          res.status(400).json({message: "Token tidak valid"})
        }
        const payload  = jwt.verify(token,process.env.ACC_TOKEN_SECRET)
        res.status(200).json({message:"success",success:true,payload})
    }catch(err){
      res.status(500).json({message:err.message,success:false})
    }
  },
  update_password: async (req, res) => {
    try{
      const {email} = req.params
      const {password} = req.body

      if(!email){
        res.status(400).json({message: "Email tidak valid"})
      }

      if(!password){
        res.status(400).json({message: "Password tidak kosong"})
      }
      const new_password = await bcrypt.hash(password, 10)
      await Users.updateOne({email},{password:new_password})
      
      res.status(200).json({message:"success",success:true})
    }catch(err){
      res.status(500).json({message:err.message,success:false})
    }
  }
}

module.exports = forgot_controller