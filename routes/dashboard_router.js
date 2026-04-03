const express = require("express")
const dashboard_controller = require("../controllers/dashboard_controller")
const router = express.Router()


router.get("/dashboard",dashboard_controller)

module.exports = router