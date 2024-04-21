const { body } = require('express-validator');
const { Customer } = require('../models');

const CustomerValidation = [
  body('FirstName').exists().withMessage('First Name is required'),
  body('LastName').exists().withMessage('Last name is required'),
  body('PhoneNo').exists().withMessage('Phone number is required')
      .bail()
      .isNumeric().withMessage('Phone number must be numeric')
      .isLength({ min: 8, max: 8 }).withMessage('Phone number must be exactly 8 digits')
      .custom(async (value, { req }) => {
          const customer = await Customer.findOne({ where: { PhoneNo: value } });
          if (customer) {
              throw new Error('Phone number is already taken');
          }
          return true;
      }),
      body('RegisterNo').exists().withMessage('Register number is required')
      .bail()
      .custom(async (value, { req }) => {
          const customer = await Customer.findOne({ where: { RegisterNo: value } });
          if (customer) {
              throw new Error('Register number is already taken');
          }
          return true;
      })
  ];

module.exports = { CustomerValidation };
