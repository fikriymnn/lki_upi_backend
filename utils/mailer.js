require("dotenv").config({ path: "config.env" });
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: process.env.SMTP_PORT,
   secure: false, // true kalau port 465, false kalau port 587 (STARTTLS)
   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
   }
})

const send_reset_email = async (to, reset_link) => {
   await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Reset Password',
      html: `<p>Klik link berikut untuk reset password kamu:</p>
             <a href="${reset_link}">${reset_link}</a>
             <p>Link ini berlaku 1 jam.</p>`
   })
}

module.exports = { send_reset_email }