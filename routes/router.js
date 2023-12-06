const router = require('express').Router()

router.use("/",(req,res)=>{res.json({test:"hai"})})

module.exports = router