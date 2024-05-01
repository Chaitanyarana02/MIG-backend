const express = require('express');
const UserController = require('../Controllers/UserController.js');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const multer = require('multer');
const upload = multer({ dest: './uploads' });
const router= express.Router();


router.post('/customer-login',upload.none(), UserController.login);
router.get('/current-customer',authMiddleware, UserController.currentuser);
router.post('/otp-verify', upload.none(),UserController.otpverify);
router.get('/Guarantee/List', upload.none(),UserController.guranteelist);
router.get('/Quits/List', upload.none(),UserController.quitsList);
router.get('/Quits/Delete', upload.none(),UserController.quitsdelete);
router.post('/logout', authMiddleware,UserController.logout);

module.exports = router;