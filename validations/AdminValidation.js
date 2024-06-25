const { body } = require('express-validator');
const { Admin, User } = require('../models');


const AdminValidation = [
    body('Name').exists().withMessage('Name is required')
    .bail()
    .isAlpha().withMessage('Name must contain only alphabetic characters')
    .isUppercase().withMessage('Name must be capitalized'),

    body('LastName').exists().withMessage('Last name is required')
    .bail()
    .isAlpha().withMessage('Last Name must contain only alphabetic characters')
    .isUppercase().withMessage('Last Name must be capitalized'),

    body('PhoneNo').exists().withMessage('Phone number is required')
        .bail()
        .isNumeric().withMessage('Phone number must be numeric')
        .isLength({ min: 8, max: 8 }).withMessage('Phone number must be exactly 8 digits')
        .custom(async (value, { req }) => {
            const admin = await Admin.findOne({ where: { PhoneNo: value } });
            if (admin) {
                throw new Error('Phone number is already taken');
            }
            const user = await User.findOne({ where: { phoneNo: value } });
            if (user) {
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
