const router = require('express').Router()
const user_controller = require('../controllers/user_controller')

router.get("/register",user_controller.register)

module.exports = router