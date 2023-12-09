const user_service = require("../services/user_service")

const user_controller = {
    register: async (req,res)=>{
       try{
         const data = await user_service.register_service(req,res)
         res.status(200).json({
            success:true,
            status:200,
            data
         })
       }catch(err){
        res.status(err.status).json({
            success: false,
            status: err.status,
            message: err.message
        })
       }
    },
    login: async (req,res)=>{
        try{
          const data = await user_service.login_service(req,res)
          res.status(200).json({
             success:true,
             status:200,
             data
          })
        }catch(err){
         res.status(err.status).json({
             success: false,
             status: err.status,
             message: err.message
         })
        }
     },
     get_user: async (req,res)=>{
        try{
          const data = await user_service.get_user_service(req)
          res.status(200).json({
             success:true,
             status:200,
             data
          })
        }catch(err){
         res.status(err.status).json({
             success: false,
             status: err.status,
             message: err.message
         })
        }
     },
     logout: async (req,res)=>{
         try{
           const data = await user_service.logout_service(res)
           res.status(200).json({
              success:true,
              status:200,
              data
           })
         }catch(err){
          res.status(err.status).json({
              success: false,
              status: err.status,
              message: err.message
          })
         }
      }
}

module.exports = user_controller