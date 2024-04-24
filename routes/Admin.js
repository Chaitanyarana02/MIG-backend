const express = require('express');
const AdminController = require('../Controllers/AdminController');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const { AdminValidation } = require('../validations/AdminValidation.js');
const multer = require('multer');
const upload = multer({ dest: './uploads' });

const router = express.Router();

router.post('/admin',upload.none(),authMiddleware,AdminValidation, AdminController.store);
router.post('/admin-edit-profile',upload.none(),authMiddleware, AdminController.editadmin);
router.get('/get-admins', authMiddleware,AdminController.getadmins);
router.get('/current-admin', authMiddleware,AdminController.currentadmin);
router.get('/show-admin/:id', authMiddleware,AdminController.showadmin);
module.exports = router;
