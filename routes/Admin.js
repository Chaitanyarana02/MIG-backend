const express = require('express');
const AdminController = require('../Controllers/AdminController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const { AdminValidation } = require('../validations/AdminValidation.js');
const multer = require('multer');
const upload = multer({ dest: './uploads' });

const router = express.Router();

router.post('/admin',upload.none(),AdminValidation, AdminController.store);
router.post('/admin-edit-profile',upload.none(),authMiddleware, AdminController.editadmin);
router.get('/get-admins', authMiddleware,AdminController.getadmins);

module.exports = router;
