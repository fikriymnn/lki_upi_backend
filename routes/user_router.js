const router = require('express').Router()
const user_controller = require('../controllers/user_controller')
const {auth,auth_admin} = require('../middlewares/auth')

router.post("/register",user_controller.register)
router.post("/login",user_controller.login)
router.delete("/logout",user_controller.logout)
router.put("/user/:id",user_controller.update_user)
router.put("/edit_user/:id",auth,user_controller.edit_user)
router.get("/user/:id?",auth,user_controller.get_user)
router.get("/remember/:id?",auth,user_controller.remember_user)
router.get("/admin_user",user_controller.getAdmin_user)

module.exports = router