const router = require('express').Router()
const content_controller = require('../controllers/content_controller')
const {auth} = require('../middlewares/auth')

router.post("/content",content_controller.add_content)
router.delete("/content/:id",content_controller.delete_content)
router.put("/content/:id",content_controller.update_content)
router.get("/content/:id?",content_controller.get_content)

module.exports = router