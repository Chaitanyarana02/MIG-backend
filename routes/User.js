const express = require('express');
const UserController = require('../Controllers/UserController.js');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const multer = require('multer');
const upload = multer({ dest: './uploads' });
const router= express.Router();


router.post('/customer-login',upload.none(), UserController.login);
router.post('/otp-verify', upload.none(),UserController.otpverify);
router.post('/logout', authMiddleware,UserController.logout);

module.exports = router;