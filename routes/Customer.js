const express = require('express');
const CustomerController = require('../Controllers/CustomerController.js');
const { CustomerValidation } = require('../validations/CustomerValidation.js');
const authMiddleware = require('../Middlewares/AuthMiddleware');
const multer = require('multer');
const upload = require('../helpers/image-uploader.js');
const path= require('path');
const bodyParser = require('body-parser');
const router= express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
  
router.post('/customer-register',upload.fields([
    { name: 'CivilWarCertificate', maxCount: 1 },
    { name: 'IdentitybackCertificate', maxCount: 1 },
    { name: 'VehicleCertificate', maxCount: 1 },
    { name: 'SteeringWheelCertificate', maxCount: 1 },
    { name: 'DrivingLinceseback', maxCount: 1 }]),authMiddleware,CustomerValidation,CustomerController.store);
router.get('/get-customers', authMiddleware,CustomerController.get);
router.get("/get-customers-details",
  authMiddleware,
  CustomerController.get_customer_details);



  
router.post('/customers-edit-profile',upload.fields([
    { name: 'CivilWarCertificate', maxCount: 1 },
    { name: 'IdentitybackCertificate', maxCount: 1 },
    { name: 'VehicleCertificate', maxCount: 1 },
    { name: 'SteeringWheelCertificate', maxCount: 1 },
    { name: 'DrivingLinceseback', maxCount: 1 }]), authMiddleware,CustomerController.edit);
router.post('/customers-excel-upload', upload.single('excelFile'),authMiddleware,CustomerController.storeExcel);

module.exports = router;