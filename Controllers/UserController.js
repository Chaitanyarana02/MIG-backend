const { User, Customer } = require('../models');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const { getNewUserData } = require('../Response/UserResponse.js');
const axios = require('axios');



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

async function currentuser(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.userType !== '0') {
        return res.status(401).json({ 
            status: 'false',
            statusCode: 401,
            message: 'You don`t have permission to access' });
    }
    const phoneNo = req.user.phoneNo;
    const customer = await Customer.findOne({ where: { PhoneNo: phoneNo } });

    if (!customer) {
      return res.status(404).json({ 
        status: 'false',
        statusCode: 404,
        message: 'Customer not found' });
    }

    res.json({ 
      customer: customer, 
      user: req.user,
      status: 'true',
      statusCode: 200,
      message: 'Customer Found Successfully' });
  } catch (error) {
    console.error('Error occurred while fetching current user:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}

async function guranteelist(req, res) {
  try {
    // const BASES_URL= '202.131.231.212';
    const { RegisterNo } = req.query;
    const BASE_URL = 'http://202.131.231.212:93/api/Guarantee/List';
    const apiKey = 'HABBVtrHLF3YV';
    const response = await axios.get(BASE_URL, {
      params: { RegisterNo },
      headers: {
        'APIkey': apiKey
      }
    });

    const responseData = response.data;
    res.json(responseData);
} catch (error) {
    console.error('Error occurred while calling external API:', error);
    res.status(500).json({
        status: 'false',
        statusCode: 500,
        message: 'Internal server error'
    });
}
}
async function quitsList(req, res) {
  try {
    const { SearchTypeId, SearchValue } = req.query;
    const BASE_URL = 'http://202.131.231.212:93/api/Quits/List';
    const apiKey = 'HABBVtrHLF3YV';
    const response = await axios.get(BASE_URL, {
      params: { SearchTypeId, SearchValue },
      headers: {
        'APIkey': apiKey
      }
    });

    // Process the response here
    const responseData = response.data;

    // Return the responseData
    res.json(responseData);
  } catch (error) {
    console.error('Error occurred while calling external API:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}

async function quitsdelete(req, res) {
  try {

    const { f1 } = req.query;
    const BASE_URL = 'http://202.131.231.212:93/api/Quits/Delete';
    const apiKey = 'HABBVtrHLF3YV';
    const response = await axios.get(BASE_URL, {
      params: { f1 },
      headers: {
        'APIkey': apiKey
      }
    });

    const responseData = response.data;
    res.json(responseData);
} catch (error) {
    console.error('Error occurred while calling external API:', error);
    res.status(500).json({
        status: 'false',
        statusCode: 500,
        message: 'Internal server error'
    });
}
}



async function logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
}




  
  module.exports = {
    // store,
    login,
    otpverify,
    logout,
    currentuser,
    guranteelist,
    quitsList,
    quitsdelete

  };
