const express = require('express')
const Auth = require('../controller/auth')

const router = express.Router()

router.post('/register', Auth.register)
router.post('/login', Auth.login)
router.get('/verify/:token', Auth.verify)
router.post('/resend', Auth.resendToken)

module.exports = router