const router = require('express').Router()

const forgot_controller = require('../controllers/forgot_controller')
router.get('/lupaPassword/:email',forgot_controller.send_email)
router.get('/verifyToken/:token',forgot_controller.verify_token)
router.put('/lupaPassword/:email',forgot_controller.update_password)

module.exports = router