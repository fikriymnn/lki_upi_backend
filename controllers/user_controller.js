const User = require('../model/user_model')
const bcrypt = require('bcrypt')
const { generate_access_token } = require('../utils/jwt')
const { send_reset_email } = require('../utils/mailer')
const crypto = require('crypto')

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
            email: body.email,
            password: hash_password,
            nama_lengkap: body.nama_lengkap,
            nama_institusi: body.nama_institusi,
            jenis_institusi: body.jenis_institusi,
            no_telp: body.no_telp,
            no_whatsapp: body.no_whatsapp,
            program_studi: body.program_studi,
            fakultas: body.fakultas
         })
         await new_user.save()

         const user = await User.findOne({ email: body.email })
         const access_token = generate_access_token({ _id: user._id, email: body.email, role: user.role, jenis_institusi: body.jenis_institusi, nama_institusi: body.nama_institusi, no_telp: body.no_telp, no_whatsapp: user.no_whatsapp, nama_lengkap: body.nama_lengkap })


         res.cookie("access_token", access_token, {
            httpOnly: true,
            path: "/",
            sameSite: 'None',
            secure: true,
         })


         return res.status(200).json({
            success: true,
            token: access_token,
            data: {
               _id: user._id, email: body.email, role: user.role, jenis_institusi: body.jenis_institusi, nama_institusi: body.nama_institusi, no_telp: body.no_telp, nama_lengkap: body.nama_lengkap, no_whatsapp: user.no_whatsapp
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
         const { password, email } = req.body
         if (!password && !email) {
            return res.status(200).json({
               status: 400,
               success: false,
               message: "email atau password salah."
            })
         }

         const user = await User.findOne({ email })
         if (!user) {
            return res.status(200).json({
               status: 400,
               success: false,
               message: "email tidak ditemukan."
            })
         }

         const compare = await bcrypt.compare(password, user.password)
         if (!compare) {
            return res.status(200).json({
               status: 400,
               success: false,
               message: "password salah."
            })
         }

         const access_token = generate_access_token({
            _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi,
            nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap,
            no_whatsapp: user.no_whatsapp, id_affiliate: user.id_affiliate // ← ditambahkan
         })

         res.cookie("access_token", access_token, {
            httpOnly: true,
            path: "/",
            sameSite: 'None',
            secure: true,
         })

         return res.status(200).json({
            success: true,
            token: access_token,
            data: {
               _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi,
               nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap,
               no_whatsapp: user.no_whatsapp, id_affiliate: user.id_affiliate, // ← ditambahkan
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
   get_user: async (req, res) => {
      try {

         const data = req.user
         if (!data) {
            res.status(200).json({
               success: false,
               data: "user is not exist"
            })
         } else {
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
   getAdmin_user: async (req, res) => {
      try {

         const data = await User.findOne({ role: 'admin' })
         const dataOp = await User.findOne({ role: 'operator' })
         const dataPj = await User.findOne({ role: 'pj' })

         res.status(200).json({
            success: true,
            data: {
               admin: data, operator: dataOp, pj: dataPj
            }
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   logout: async (req, res) => {
      try {
         if (!req.cookies.access_token) {
            return res.status(200).json({
               success: false,
               message: "Logout failed!"
            })
         }
         res.clearCookie('access_token', {
            sameSite: 'None',
            secure: true,
         })

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
   update_user: async (req, res) => {
      try {
         const body = req.body
         const { id } = req.params
         await User.updateOne({ _id: id }, body)
         const user = await User.findOne({ _id: id })
         const access_token = generate_access_token({
            _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap, no_whatsapp: user.no_whatsapp
         })


         res.cookie("access_token", access_token, {
            httpOnly: true,
            path: "/",
            sameSite: 'None',
            secure: true,
         })
         return res.status(200).json({
            success: true,
            data: 'update successfully'
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   edit_user: async (req, res) => {
      try {
         const body = req.body
         const { password } = req.body
         const { id } = req.params
         if (password) {
            const hash_password = await bcrypt.hash(password, 10)
            body.password = hash_password
            await User.updateOne({ _id: id }, body)
         } else {
            await User.updateOne({ _id: id }, body)
         }
         return res.status(200).json({
            success: true,
            data: 'update successfully'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }, remember_user: async (req, res) => {
      try {

         const data = req.user
         const user = req.user
         if (!data) {
            res.status(200).json({
               success: false,
               data: "user is not exist"
            })
         } else {
            const access_token = generate_access_token({
               _id: user._id, email: user.email, role: user.role, jenis_institusi: user.jenis_institusi, nama_institusi: user.nama_institusi, no_telp: user.no_telp, nama_lengkap: user.nama_lengkap, no_whatsapp: user.no_whatsapp
            })
            const millisecondsInDay = 1000 * 60 * 60 * 24;
            const expiresInMilliseconds = millisecondsInDay * 999;

            res.cookie("access_token", access_token, {
               httpOnly: true,
               path: "/",
               sameSite: 'None',
               secure: true,
            })
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
   forgot_password: async (req, res) => {
      try {
         const { email } = req.body
         const user = await User.findOne({ email })
         if (!user) {
            return res.status(200).json({
               status: 400,
               success: false,
               message: "Email tidak ditemukan."
            })
         }

         const reset_token = crypto.randomBytes(32).toString('hex')
         user.reset_password_token = reset_token
         user.reset_password_expires = Date.now() + 3600000 // 1 jam
         await user.save()

         const reset_link = `${process.env.FRONTEND_URL}/lupapassword/${reset_token}`
         await send_reset_email(user.email, reset_link)

         return res.status(200).json({
            success: true,
            message: "Link reset password telah dikirim ke email."
         })
      } catch (err) {
         console.log(err.message)
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   reset_password: async (req, res) => {
      try {
         const { token } = req.params
         const { password } = req.body

         const user = await User.findOne({
            reset_password_token: token,
            reset_password_expires: { $gt: Date.now() }
         })

         if (!user) {
            return res.status(200).json({
               status: 400,
               success: false,
               message: "Token tidak valid atau sudah kadaluarsa."
            })
         }

         const hash_password = await bcrypt.hash(password, 10)
         user.password = hash_password
         user.reset_password_token = null
         user.reset_password_expires = null
         await user.save()

         return res.status(200).json({
            success: true,
            message: "Password berhasil direset."
         })
      } catch (err) {
         console.log(err.message)
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },
   // ==============================
   // AFFILIATE USER (role: laboran / ketua_lab) — dibuat & dikelola admin
   // ==============================
   get_affiliate_user: async (req, res) => {
      try {
         const { id } = req.params
         const ROLES = ['laboran', 'ketua_lab']

         if (id) {
            const data = await User.findOne({ _id: id, role: { $in: ROLES } })
               .select('-password -reset_password_token -reset_password_expires')
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'User affiliate tidak ditemukan'
               })
            }
            return res.status(200).json({ success: true, data })
         }

         const { id_affiliate = '', search = '', role = '' } = req.query

         if (!id_affiliate) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'id_affiliate wajib diisi'
            })
         }

         const filter = {
            id_affiliate,
            role: ROLES.includes(role) ? role : { $in: ROLES },
            $or: [
               { nama_lengkap: { $regex: search, $options: 'i' } },
               { email: { $regex: search, $options: 'i' } }
            ]
         }

         const data = await User.find(filter)
            .select('-password -reset_password_token -reset_password_expires')
            .sort({ createdAt: -1 })

         return res.status(200).json({ success: true, data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   add_affiliate_user: async (req, res) => {
      try {
         const body = req.body
         const ROLES = ['laboran', 'ketua_lab']

         if (!body.id_affiliate) {
            return res.status(200).json({ success: false, status: 400, message: 'Lab affiliate wajib diisi' })
         }
         if (!ROLES.includes(body.role)) {
            return res.status(200).json({ success: false, status: 400, message: 'Role tidak valid' })
         }
         if (!body.nama_lengkap || !body.nama_lengkap.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Nama lengkap wajib diisi' })
         }
         if (!body.email || !body.email.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Email wajib diisi' })
         }
         if (!body.no_whatsapp || !body.no_whatsapp.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'No WhatsApp wajib diisi' })
         }
         if (!body.password || body.password.length < 6) {
            return res.status(200).json({ success: false, status: 400, message: 'Password minimal 6 karakter' })
         }

         const email_exist = await User.findOne({ email: body.email })
         if (email_exist) {
            return res.status(200).json({ success: false, status: 400, message: 'Email telah digunakan' })
         }

         const hash_password = await bcrypt.hash(body.password, 10)

         const new_user = new User({
            nama_lengkap: body.nama_lengkap,
            email: body.email,
            password: hash_password,
            no_whatsapp: body.no_whatsapp,
            id_affiliate: body.id_affiliate,
            role: body.role,
            status: body.status || 'aktif'
         })

         await new_user.save()

         const data = new_user.toObject()
         delete data.password

         return res.status(200).json({
            success: true,
            message: 'User affiliate berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   update_affiliate_user: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body
         const ROLES = ['laboran', 'ketua_lab']

         const user = await User.findOne({ _id: id, role: { $in: ROLES } })
         if (!user) {
            return res.status(200).json({ success: false, status: 404, message: 'User affiliate tidak ditemukan' })
         }

         if (body.role && !ROLES.includes(body.role)) {
            return res.status(200).json({ success: false, status: 400, message: 'Role tidak valid' })
         }

         const update = { ...body }
         delete update.id_affiliate // lab affiliate tidak boleh dipindah lewat endpoint ini

         if (update.password) {
            update.password = await bcrypt.hash(update.password, 10)
         } else {
            delete update.password
         }

         await User.updateOne({ _id: id }, update)

         return res.status(200).json({ success: true, message: 'User affiliate berhasil diperbarui' })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   delete_affiliate_user: async (req, res) => {
      try {
         const { id } = req.params
         const ROLES = ['laboran', 'ketua_lab']

         const user = await User.findOne({ _id: id, role: { $in: ROLES } })
         if (!user) {
            return res.status(200).json({ success: false, status: 404, message: 'User affiliate tidak ditemukan' })
         }

         await User.deleteOne({ _id: id })

         return res.status(200).json({ success: true, message: 'User affiliate berhasil dihapus' })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },
}

module.exports = user_controller
