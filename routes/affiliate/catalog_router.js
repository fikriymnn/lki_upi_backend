const router = require("express").Router()
const catalog_controller = require('../../controllers/affiliate/catalog_controller')
const { auth } = require('../../middlewares/auth')

router.get("/catalog/:id?", catalog_controller.get_catalog)
router.post("/catalog/:id?", auth, catalog_controller.add_catalog)
router.put("/catalog/:id", auth, catalog_controller.update_catalog)
router.delete("/catalog/:id", auth, catalog_controller.delete_catalog)

module.exports = router