const jwt = require("jsonwebtoken")

const auth_middleware = {
    auth: (req,res,next)=>{
        try{
            const token = req.cookies.access_token
            if(!token){
                return res.status(401).json({
                    success:false,
                    status_code: 401,
                    message: "Access token is not exist."
                })
            }
            jwt.verify(token,process.env.ACC_TOKEN_SECRET,(err,payload)=>{
                if(err){
                    return res.status(403).json({
                        success:false,
                        status_code: 403,
                        message: "Access token invalid."
                    })
                }
                req.user = payload
                next()
            })
        }catch(err){
            return res.status(500).json({
                success:false,
                status_code: 500,
                message:err.message

            })
        }
    },
    auth_admin:(req,res,next)=>{
        try{
            const user = req.user
            if(!user){
                return  res.status(403).json({
                    success:false,
                    status_code: 403,
                    message: "Access token invalid."
                })
            }
            if(user.role!=="admin"){
                return res.status(403).json({
                    success:false,
                    status_code: 403,
                    message: "You are not permitted to access"
                })
            }

            next()
        }catch(err){
            return res.status(500).json({
                success:false,
                status_code: 500,
                message:err.message

            })
        }
    },
    auth_operator:(req,res,next)=>{
        try{
            const user = req.user
            if(!user){
                return res.status(403).json({
                    success: false,
                    status_code: 403,
                    message: "Access token invalid."
                })
            }
            if(user.role!=="operator"){
                return res.status(403).json({
                    success:false,
                    status_code: 403,
                    message: "You are not permitted to access"
                })
            }

            next()
        }catch(err){
            return res.status(500).json({
                success:false,
                status_code: 500,
                message:err.message

            })
        }
    }
}

module.exports = auth_middleware