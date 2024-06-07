const router = require('express').Router()
const content_controller = require('../controllers/content_controller')
const multer = require('multer')
const {auth,auth_admin} = require('../middlewares/auth')

router.post("/content",multer().any(),content_controller.add_content)
router.delete("/content/:id",auth,auth_admin,content_controller.delete_content)
router.put("/content/:id",content_controller.update_content)
router.put("/content_foto/:id",multer().single('foto'),content_controller.update_foto)
router.put("/content_contoh_hasil/:id",multer().single('contoh_hasil'),content_controller.update_contoh_hasil)
router.get("/content/:id?",content_controller.get_content)

module.exports = router