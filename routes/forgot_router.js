const router = require('express').Router()

const forgot_controller = require('../controllers/forgot_controller')
router.get('/lupaPassword/:email',forgot_controller.sendEmail)

module.exports = router