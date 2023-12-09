const jwt = require("jsonwebtoken")

const jwt = {
    generate_access_token: (payload)=>{
     const token = jwt.sign(payload,process.env.ACC_TOKEN_SECRET)
     return token
    }
}

module.exports = jwt