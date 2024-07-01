const express = require('express');
const UserController = require('../Controllers/UserController.js');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const multer = require('multer');

const router= express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 8048, // 2GB per file
      fieldSize: 1024 * 1024 * 8048,  // 10MB per field
      fields: 500000,                   // limit the number of non-file fields
      files: 1000                     // limit the number of file fields
    }
  });



router.post('/customer-login',upload.none(), UserController.login);
router.post('/resendOtp',upload.none(), UserController.resendOtp);
router.get('/current-customer',authMiddleware, UserController.currentuser);
router.post('/otp-verify', upload.none(),UserController.otpverify);
router.get('/Guarantee/List', upload.none(),UserController.guranteelist);
router.get('/Quits/List', upload.none(),UserController.quitsList);
router.get('/getClaimImg', upload.none(),UserController.getClaimImg);
router.post('/Quits/Delete', upload.none(),UserController.quitsdelete);
router.post('/Quits/Insert',upload.none(),UserController.sendclaim);
router.post('/logout', authMiddleware,UserController.logout);

module.exports = router;