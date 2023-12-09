const router = require('express').Router()
const user_controller = require('../controllers/user_controller')
const {auth} = require('../middlewares/auth')

router.post("/register",user_controller.register)
router.post("/login",user_controller.login)
router.delete("/logout",auth,user_controller.logout)
router.get("/user",auth,user_controller.get_user)

module.exports = router