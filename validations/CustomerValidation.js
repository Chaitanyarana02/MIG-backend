const { body } = require('express-validator');
const { Customer, User } = require('../models');

// const mongolianRegex = /^[\u1800-\u18AF\u2800-\u28FF\s]+$/;

const CustomerValidation = [

    // body('FirstName')
    // .exists().withMessage('First Name is required')
    // .bail()
    // .matches(/^[A-Za-z\s]+$/).withMessage('First Name must contain only alphabetic characters and spaces')
    // .bail()
    // .custom(value => /^[A-Z]/.test(value)).withMessage('First Name must be capitalized'),

    // body('LastName')
    // .exists().withMessage('Last name is required')
    // .bail()
    // .matches(/^[A-Za-z\s]+$/).withMessage('Last Name must contain only alphabetic characters and spaces')
    // .bail()
    // .custom(value => /^[A-Z]/.test(value)).withMessage('Last Name must be capitalized'),

      // Range for Mongolian Unicode characters



  body('PhoneNo').exists().withMessage('Phone number is required')
      .bail()
      .isNumeric().withMessage('Phone number must be numeric')
      .isLength({ min: 8, max: 8 }).withMessage('Phone number must be exactly 8 digits')
      .custom(async (value, { req }) => {
          const customer = await Customer.findOne({ where: { PhoneNo: value } });
          if (customer) {
              throw new Error('Phone number is already taken');
          }
          const user = await User.findOne({ where: { phoneNo: value } });
            if (user) {
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
