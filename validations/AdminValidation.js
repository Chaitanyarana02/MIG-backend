const { body } = require('express-validator');
const { Admin } = require('../models');


const AdminValidation = [
    body('Name').exists().withMessage('Name is required'),
    body('LastName').exists().withMessage('Last name is required'),
    body('PhoneNo').exists().withMessage('Phone number is required')
        .bail()
        .isNumeric().withMessage('Phone number must be numeric')
        .isLength({ min: 8, max: 8 }).withMessage('Phone number must be exactly 8 digits')
        .custom(async (value, { req }) => {
            const admin = await Admin.findOne({ where: { PhoneNo: value } });
            if (admin) {
                throw new Error('Phone number is already taken');
            }
            return true;
        }),
        body('RegisterNumber').exists().withMessage('Register number is required')
        .bail()
        .custom(async (value, { req }) => {
            const admin = await Admin.findOne({ where: { RegisterNumber: value } });
            if (admin) {
                throw new Error('Register number is already taken');
            }
            return true;
        })
];

module.exports = { AdminValidation };
