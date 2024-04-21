const { User } = require('../models');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const { getNewUserData } = require('../Response/UserResponse.js');



async function login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
        const { phoneNo } = req.body;
        const user = await User.findOne({ where: { phoneNo } });
    
        if (!user) {
          return res.status(401).json({
            status: 'false',
            statusCode: 401,
            message: 'User not found' 
        });
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000);
        user.otp = generatedOtp;
        await user.save(); 
        const responseData = getNewUserData(user);

      res.status(200).json({
            data:responseData,
            status: 'true',
            statusCode: 200,
            message: 'OTP sent successfully'
      });
    } catch (error) {
      console.error('Error occurred while sending OTP:', error);
      res.status(500).json({
        status: 'false',
        statusCode: 500,
        message: 'Internal server error'
      });
    }
}


  async function otpverify(req, res) {
    try {
        const { phoneNo, otp } = req.body;

    const user = await User.findOne({ where: { phoneNo } });

    if (!user) {
      return res.status(404).json({ 
        status: 'false',
        statusCode: 404,
        message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ 
        status: 'false',
        statusCode: 400,
        message: 'Invalid OTP!' });
    }

    // Update user's fields
    user.isOtpVerified = '1';
    user.otpVerifiedAt = new Date();
    await user.save();
    const token = jwt.sign({ id: user.id }, 'your_secret_key');
    const responseData = getNewUserData(user);

    res.status(200).json({ 
        data:responseData,
        token :token,
        status: 'true',
        statusCode: 200,
        message: 'Login Successfully' ,
    });
  } catch (error) {
    console.error('Error occurred while verifying OTP:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: 'Internal server error'
    });
  }
};

async function logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
}
  
  module.exports = {
    // store,
    login,
    otpverify,
    logout
  };
