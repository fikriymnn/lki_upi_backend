const router = require('express').Router()
const user_controller = require('../controllers/user_controller')
const {auth} = require('../middlewares/auth')

router.post("/register",user_controller.register)
router.post("/login",user_controller.login)
router.delete("/logout",user_controller.logout)
router.put("/user/:id",auth,user_controller.update_user)
router.get("/user/:id?",auth,user_controller.get_user)

module.exports = router