const { User, Customer ,SendClaim ,QuitsImages } = require('../models');
const cron = require('node-cron');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const { getNewUserData } = require('../Response/UserResponse.js');
const { getClaim } = require('../Response/SendClaimResponse.js');
const axios = require('axios');
const AWS = require('aws-sdk');
require('dotenv').config();
const fs = require('fs');
const s3 = new AWS.S3();
const moment = require('moment');


async function login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
        const { phoneNo } = req.body;
        const user = await User.scope('withPassword').findOne({ where: { phoneNo } });
    
        if (!user) {
          return res.status(401).json({
            status: 'false',
            statusCode: 401,
            message: 'User not found' 
        });
        }

        if(!user.isActive){
          return res.status(401).json({
            status: 'false',
            statusCode: 401,
            message: 'User is not active' 
        });
        }

        if(!user.password){

            let generatedOtp ;
            if(user.userType != 2){
              generatedOtp = Math.floor(100000 + Math.random() * 900000);
              user.otp = generatedOtp;
            await user.save();
            } else{
              generatedOtp = '000000'
              user.otp = generatedOtp;
            }
            await user.save();  
            const server_otp_status = await sendServerOtp(phoneNo,generatedOtp) ; 
            const sms_services_use = await checkMobileNetwork(phoneNo) ; 
            
            const responseData = getNewUserData(user);
    
              res.status(200).json({
                    data:responseData,
                    serverOTPsendStatus:server_otp_status ,
                    smsService:sms_services_use ,
                    status: 'true',
                    statusCode: 200,
                    message: 'OTP sent successfully'
            });

          
        }else{


          res.status(200).json({
            data:getNewUserData(user),  
            password:true,
            status: 'true',
            statusCode: 200
          });


        }
        
       
    } catch (error) {
      console.error('Error occurred while sending OTP:', error);
      res.status(500).json({
        status: 'false',
        statusCode: 500,
        message: 'Internal server error'
      });
    }
}


async function verifyPassword(req,res){
  try {
    const { phoneNo, password } = req.body;

    // Find the user by phone number
    const user = await User.scope('withPassword').findOne({ where: { phoneNo } });
    if (!user) {
      return res.status(404).json({ status: 'false', statusCode: 404, message: 'User not found' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'false', statusCode: 401, message: 'Invalid password' });
    }

    // Return user data (excluding the password)
    const { password: _, ...userWithoutPassword } = user.toJSON();

    const token = jwt.sign({ id: user.id }, 'your_secret_key');
    const responseData = getNewUserData(user);

    res.status(200).json({
      data: responseData,
      token:token,
      status: 'true',
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error occurred while verifying password:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: error.message || 'Internal server error',
    });
  }


}


async function storePassword(req, res) {
  try {
    const { phoneNo, password } = req.body;
    const user = await User.findOne({ where: { phoneNo } });
    if (!user) {
      throw new Error('User not found');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
     const { password: _, ...userWithoutPassword } = user.toJSON();

     const token = jwt.sign({ id: user.id }, 'your_secret_key');
     const responseData = getNewUserData(user);
    res.json({
      data: responseData,
      status: 'true',
      statusCode: 200,
      token: token
    });

  } catch (error) {
    console.error('Error occurred while storing password:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: error.message || 'Internal server error',
    });
  }
}


async function forgotPassword(req , res){

  try {
    const { phoneNo, password ,otp } = req.body;
    const user = await User.findOne({ where: { phoneNo } });
    if (!user) {
      throw new Error('User not found');
    }


    if (user.otp !== otp) {
      return res.status(400).json({ 
        status: 'false',
        statusCode: 400,
        message: 'Invalid OTP!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
     const { password: _, ...userWithoutPassword } = user.toJSON();

     const token = jwt.sign({ id: user.id }, 'your_secret_key');
     const responseData = getNewUserData(user);
    res.json({
      data: responseData,
      status: 'true',
      statusCode: 200,
      token: token
    });

  } catch (error) {
    console.error('Error occurred while storing password:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: error.message || 'Internal server error',
    });
  }


}


async function resendOtp(req, res) {
  try {
      const user = await User.findOne({ where: { phoneNo: req.body.phoneNo } });

      if (!user) {
          throw new Error('User not found');
      }

      const currentTime = new Date();
      const otpResendInterval = 2 * 60 * 1000; // 2 minutes in milliseconds

      if (user.otpGeneratedAt) {
          const timeElapsed = currentTime - new Date(user.otpGeneratedAt);
          if (timeElapsed < otpResendInterval) {
              const timeLeftInSeconds = Math.ceil((otpResendInterval - timeElapsed) / 1000);

              // Return error response with remaining time information
              return res.status(400).json({
                  status: 'false',
                  statusCode: 400,
                  message: `Please try again after a moment to resend the OTP.`,
                  timeLeftInSeconds: timeLeftInSeconds // Include remaining time in seconds
              });
          }
      }

      let generatedOtp;
      if (user.userType != 2) {
          generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP as a string
      } else {
          generatedOtp = '000000';
      }

      user.otp = generatedOtp;
      user.otpGeneratedAt = currentTime;
      user.otpCount = (user.otpCount || 0) + 1;

      await user.save();

      const phoneNo = req.body.phoneNo; // Extract phone number from req.body
      const server_otp_status = await sendServerOtp(phoneNo, generatedOtp); // Pass phone number to sendServerOtp
      const sms_services_use = await checkMobileNetwork(phoneNo); // Pass phone number to checkMobileNetwork

      const responseData = getNewUserData(user);

      res.status(200).json({
          data: responseData,
          serverOTPsendStatus: server_otp_status,
          smsService: sms_services_use,
          status: 'true',
          statusCode: 200,
          message: 'OTP sent successfully'
      });
  } catch (error) {
      console.error('Error occurred while sending OTP:', error);
      res.status(500).json({
          status: 'false',
          statusCode: 500,
          message: error.message || 'Internal server error'
      });
  }
}


function checkMobileNetwork(phoneNo) {
  const firstTwoDigits = phoneNo.substring(0, 2);

  switch (firstTwoDigits) {
      case '99':
      case '95':
      case '94':
      case '85':
          return 'MOBICOM';
      case '91':
      case '90':
      case '96':
          return 'SKYTEL';
      case '88':
      case '89':
      case '86':
      case '80':
          return 'UNITEL';
      case '93':
      case '98':
      case '97':
          return 'GMOBILE';
      default:
          return 'Unknown';
  }
}


async function sendServerOtp(phoneNo , genratedOtp) {


  const network_type = checkMobileNetwork(phoneNo);



  function getNetworkTypeAccordingSMSAPi(network_type, phoneNo) {
    const msg = `MIG Даатгал : Таны нэг удаагийн нэвтрэх нууц үг ${genratedOtp}`;
    const encodedMsg = encodeURIComponent(msg);
      switch (network_type) {
          case 'MOBICOM':
              return `http://27.123.214.168/smsmt/mt?servicename=mig&username=daatgal&from=136000&to=${phoneNo}&msg=${encodedMsg}`;
          case 'SKYTEL':
              return `http://smsgw.skytel.mn/SMSGW-war/pushsms?id=1000076&src=136000&dest=${phoneNo}&text=${encodedMsg}`;
          case 'UNITEL':
              return `https://sms.unitel.mn/sendSMS.php?uname=mig&upass=Unitel88&sms=${encodedMsg}&from=136000&mobile=${phoneNo}`;
          case 'GMOBILE':
              return `https://smstusgai.gmobile.mn/cgi-bin/sendsms?username=mig_daatgal&password=daatgal*136&from=136000&to=${phoneNo}&text=${encodedMsg}`;
      }
  }

    const apiUrl = getNetworkTypeAccordingSMSAPi(network_type, phoneNo); // Corrected calling of the function
    apiRespons = null ;
    try {
        const res = await axios.post(apiUrl); // Use await to wait for the axios response
        apiRespons =  res.data;
    } catch (error) {
        console.error("Error sending SMS: ", error);
    }
    return apiRespons;
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
    // const BASES_URL= 'localhost';
    const { RegisterNo } = req.query;
    const BASE_URL = `http://${process.env.EXT_API_PORT}:93/api/Guarantee/List`;
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
    let user;
    let updatedData;
    if (SearchValue == 'all') {
      
      updatedData = await SendClaim.findAll({
        where: {
          f2: SearchTypeId,
        },
        order: [
          ['beginDate', 'DESC']
        ]
        
      });
      user = await Customer.findAll();
  
      const customerMap = {};
      user.forEach(customer => {
        customerMap[customer.RegisterNo] = customer;
      });
      // Attach Customer data to each SendClaim where RegisterNo matches
      updatedData = updatedData.map(sendClaim => {
        const registerNo = sendClaim.RegisterNo;
        if (customerMap.hasOwnProperty(registerNo)) {
          sendClaim.dataValues.Customer = customerMap[registerNo];
        }
        return sendClaim? sendClaim : '' ;
      });
    } 
    else {
      updatedData = await SendClaim.findAll({
            where: {
              f2: SearchTypeId,
              RegisterNo: SearchValue
            },
            order: [
              ['beginDate', 'DESC']
            ]
          }); 
          user = await Customer.findOne({ where: { RegisterNo:SearchValue } });
    }
    res.json({
      status: 'success',
      message: 'Records found and processed successfully.',
      quitsLists: [updatedData.map(getClaim) , user],
      updatedData:updatedData
    });

  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({
      error: error.message,
      status: 'false',
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}


async function getClaimImg(req, res) {
  try {
      // Assuming req.body.sendClaimId contains the sendClaimId value
      const sendClaimId = req.query.sendClaimId;

      // Fetch QuitsImages based on sendClaimId
      const Images = await QuitsImages.findAll({ where: { sendClaimId } });

      if (!Images) {
          // Handle case where no image is found
          return res.status(404).json({
              status: 'error',
              message: 'No image found for the provided sendClaimId.',
          });
      }

      // Return the found image data
      return res.json({
          status: 'success',
          message: 'Image found successfully.',
          image: Images, // Adjust this based on how you want to structure the response
      });
  } catch (error) {
      console.error('Error fetching image:', error);
      return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch image.',
          error: error.message,
      });
  }
}


async function quitsdelete(req, res) {
  try {

    const { f1 } = req.body;
    const BASE_URL = `http://${process.env.EXT_API_PORT}:93/api/Quits/Delete`;
    const apiKey = 'HABBVtrHLF3YV';
    const response = await axios.post(BASE_URL, {
      f1: f1
    }, {
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


const path = require('path');
const { promisify } = require('util');
const { where } = require('sequelize');
const writeFile = promisify(fs.writeFile);
async function sendclaim(req, res) {
  try {
    const {f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13, QUITSIMAGES } = req.body;

    const BASE_URL = `http://${process.env.EXT_API_PORT}:93/api/Quits/Insert`;
    const apiKey = 'HABBVtrHLF3YV';
    
    const postData = {
      f1,
      f2,
      f3,
      f4,
      f5,
      f6,
      f7,
      f8,
      f9,
      f10,
      f11,
      f12,
      f13,

      // QUITSIMAGES: processedFiles
    };

    const response = await axios.post(BASE_URL, postData, {
      headers: {
        'APIkey': apiKey
      },
      timeout: 15000
    });

    const responseData = response.data;
    const quitsNo = responseData.quitsNo;
    const customer = await Customer.findOne({ where: { PhoneNo:f11 } });
    const RegisterNo = customer.RegisterNo;
    let createClaim = null;
   
    if (customer) {
      createClaim =   await SendClaim.create({
         f1,
         f2,
         f3,
         f4,
         f5,
         f6,
         f7 ,
         f8,
         f9,
         f10,
         f11,
         f12,
         f13,
         RegisterNo:RegisterNo,
         quitsNo:quitsNo,
         beginDate:f6
       });
     }else{
       res.status(500).json({
         status: 'false',
         error: "customer not exsist !!!",
         statusCode: 500,
         message: 'customer not exsist !!!'
       });
     }


    // local storeage inner data store 

    // Ensure the directory exists (create if not)
    const uploadDir = path.join(__dirname, '..', 'public', 'sendclaim');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Array to store file paths or identifiers
    const processedFiles = [];
    const newQuitsImages = [];

    // Process each file in QUITSIMAGES
    for (let i = 0; i < QUITSIMAGES.length; i++) {
        const fileData = QUITSIMAGES[i];
        const {  F1, F2, F3, F4 , quitsType } = fileData;

        // Example: Assuming F4 contains binary data as a base64 string
        const base64Data = F4.replace(/^data:image\/(?:png|jpeg|jpg);base64,/, ''); // Adjust based on actual content type
        // const fileExtension = path.extname(F3); // Get file extension
        const fileName = `${F3}`; // Construct file name with original extension

        // Write binary data to file
        const filePath = path.join(uploadDir, fileName); // Construct full file path
        await writeFile(filePath, base64Data, 'base64');

        const imageUrl = `${process.env.DOMAIN}/api/sendclaim/${fileName}`;
        console.log('quitsType:', quitsType);
        // Store in database using the Sequelize model
              const newQuitsImage = await QuitsImages.create({
                  sendClaimId: createClaim.id,
                  quitsType: quitsType , // Adjust as per your actual logic
                  f1: F1,
                  f2: F2,
                  f3: imageUrl
              });

              newQuitsImages.push(newQuitsImage); // Collect newly created quits image data

              processedFiles.push({
                  F1: F1,
                  F2: fileName,
                  F3: filePath,
                  imageUrl: imageUrl
              });
          }


    res.json({
      status: 'success',
      message: 'Data sent successfully',
      data: responseData,
      quitsNo: quitsNo,
      RegisterNo:RegisterNo,
      sendClaim:createClaim,
       processedFiles: processedFiles
    });
  } catch (error) {
    console.error('Error occurred while calling external API:', error);
    res.status(500).json({
      status: 'false',
      error: error.response ? error.response.data : error.message,
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}


async function updateclaim(req, res) {
  try {
    const {f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13, QUITSIMAGES  } = req.body;

    const BASE_URL = `http://${process.env.EXT_API_PORT}:93/api/Quits/Update`;
    const apiKey = 'HABBVtrHLF3YV';
    
    const postData = {
      f1,
      f2,
      f3,
      f4,
      f5,
      f6,
      f7,
      f8,
      f9,
      f10,
      f11,
      f12,
      f13,

      // QUITSIMAGES: processedFiles
    };

    const response = await axios.post(BASE_URL, postData, {
      headers: {
        'APIkey': apiKey
      },
      timeout: 15000
    });

    const responseData = response.data;
    const quitsNo = responseData.quitsNo;
    const customer = await Customer.findOne({ where: { PhoneNo:f11 } });
    const RegisterNo = customer.RegisterNo;
    let createClaim = null;
   
    if (customer) {
      createClaim =   await SendClaim.update(
        {
         f1,
         f2,
         f3,
         f4,
         f5,
         f6,
         f7 ,
         f8,
         f9,
         f10,
         f11,
         f12,
         f13,
         RegisterNo:RegisterNo,
         quitsNo:quitsNo,
         beginDate:f6
       },
       {
         where: {
          quitsNo: f1, // Replace 'id' with the appropriate field name for your condition
          }
        }
      
      );
     }else{
       res.status(500).json({
         status: 'false',
         error: "customer not exsist !!!",
         statusCode: 500,
         message: 'customer not exsist !!!'
       });
     }


    // local storeage inner data store 

    // Ensure the directory exists (create if not)
    const uploadDir = path.join(__dirname, '..', 'public', 'sendclaim');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Array to store file paths or identifiers
    const processedFiles = [];
    const newQuitsImages = [];


   

    // Process each file in QUITSIMAGES
    for (let i = 0; i < QUITSIMAGES.length; i++) {
        const fileData = QUITSIMAGES[i];
        const {  F1, F2, F3, F4 , quitsType } = fileData;

        // Example: Assuming F4 contains binary data as a base64 string
        const base64Data = F4.replace(/^data:image\/(?:png|jpeg|jpg);base64,/, ''); // Adjust based on actual content type
        // const fileExtension = path.extname(F3); // Get file extension
        const fileName = `${F3}`; // Construct file name with original extension

        // Write binary data to file
        const filePath = path.join(uploadDir, fileName); // Construct full file path
        await writeFile(filePath, base64Data, 'base64');

        const imageUrl = `${process.env.DOMAIN}/api/sendclaim/${fileName}`;
        console.log('quitsType:', quitsType);
        // Store in database using the Sequelize model
        // await QuitsImages.destroy({
        //   where: { sendClaimId: f1 }
        //    });
              const newQuitsImage = await QuitsImages.create({
                  sendClaimId: f1,
                  quitsType: quitsType , // Adjust as per your actual logic
                  f1: F1,
                  f2: F2,
                  f3: imageUrl
              },
             
            );

              newQuitsImages.push(newQuitsImage); // Collect newly created quits image data

              processedFiles.push({
                  F1: F1,
                  F2: fileName,
                  F3: filePath,
                  imageUrl: imageUrl
              });
          }


    res.json({
      status: 'success',
      message: 'Data sent successfully',
      data: responseData,
      quitsNo: quitsNo,
      RegisterNo:RegisterNo,
      sendClaim:createClaim,
       processedFiles: processedFiles
    });
  } catch (error) {
    console.error('Error occurred while calling external API:', error);
    res.status(500).json({
      status: 'false',
      error: error.response ? error.response.data : error.message,
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}

async function logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
}


async function updateRecords() {
  const BASE_URL = `http://${process.env.EXT_API_PORT}:93/api/Quits/List`;
  const apiKey = 'HABBVtrHLF3YV';

  try {
    let SearchValue = 'all';
    let SearchTypeId = '3';
    const response = await axios.get(BASE_URL, {
      params: { SearchTypeId:'3', SearchValue:'all' },
      headers: {
        'APIkey': apiKey
      }
    });



    
    let staticRespons = {
      "message": "Амжилттай",
      "quitsLists": [
          {
              "contractNo": "23201/1386",
              "contractType": "Гэрээ",
              "lastName": "",
              "firstName": "Норинко интэрнэшнл күүперэшн компаний пайплайн пи и төлөөний газар",
              "registerNo": "9932755",
              "productName": "Эрүүл мэндийн даатгал",
              "rate": 1700000000,
              "beginDate": "2023-12-18T00:00:00",
              "endDate": "2024-12-17T00:00:00",
              "contractStatusName": "Идэвхтэй",
              "quitsNo": "2406311",
              "calledDate": "2024-03-24T00:00:00",
              "invoiceDate": "2024-03-24T00:00:00",
              "riskDate": "2024-03-24T00:00:00",
              "invoiceAmount": 445,
              "statusName": "Тооцоолж буй",
              "quitsImages": [
                  { 
                      "f1": 1,
                      "f2": "https://mig.xolbooc.com/storage/quit/2024-06-03/665d883e8b881.jpeg",
                      "f3": "https://mig.xolbooc.com/storage/quit/2024-06-03/665d883e8b881.jpeg"
                  }
              ]
          }
      ]
  }

  let ApiRes = response.data.quitsLists;
  // const ApiRes = staticRespons.quitsLists;

  
    if(!ApiRes){
       ApiRes = staticRespons.quitsLists;
    } 

    let sendClaims;
    if (SearchValue == 'all') {
      sendClaims = await SendClaim.findAll({
        where: {
          f2: SearchTypeId
        }
      });
    } else {
      sendClaims = await SendClaim.findAll({
        where: {
          f2: SearchTypeId,
          RegisterNo: SearchValue
        }
      });
    }

    if (!sendClaims || sendClaims.length === 0) {
      console.log('No matching records found.');
      return;
    }

    const responseData = sendClaims.map(getClaim);

    const updatePromises = ApiRes.map(async (apiItem) => {
      const matchedResponse = responseData.find(respItem => respItem.quitsNo === apiItem.quitsNo);

      if (matchedResponse) {
        try {
          await SendClaim.update({
            productName: apiItem.productName,
            beginDate: apiItem.beginDate,
            endDate: apiItem.endDate,
            status: apiItem.statusName,
            rate: apiItem.rate
          }, {
            where: {
              quitsNo: matchedResponse.quitsNo
            }
          });

          const updatedRecord = await SendClaim.findOne({
            where: {
              quitsNo: matchedResponse.quitsNo
            }
          });

          console.log(`Record updated: ${apiItem.quitsNo}`);
          return {
            ...apiItem,
            responseData: updatedRecord,
            updateStatus: 'updated'
          };
        } catch (error) {
          console.error('Error updating record:', error);
          return {
            ...apiItem,
            responseData: matchedResponse,
            updateStatus: 'update_failed'
          };
        }
      }
      return null;
    });
    console.log(updatePromises);

    await Promise.all(updatePromises);
    console.log('Update process completed.');
  } catch (error) {
    console.error('Error fetching or updating data:', error);
  }
}


async function addPreviousClaim(req, res) {

  // get all user from customer table
  const customers = await Customer.findAll({
    attributes: ['RegisterNo']
  });

  // Map the results to get an array of RegisterNo values
  const RegisterNoList = customers.map(customer => customer.RegisterNo);


  const BASE_URL = `http://${process.env.EXT_API_PORT}:93/api/Quits/List`;
  const apiKey = 'HABBVtrHLF3YV';
  // const registerNo = req.body.RegisterNo; // Adjust if neede  

  try {

    for (const registerNo of RegisterNoList) {

    const response = await axios.get(BASE_URL, {
      params: { SearchTypeId: '2', SearchValue: registerNo },
      headers: {
        'APIkey': apiKey
      }
    }); 

    const user  = await Customer.findOne({ where: { registerNo } });

    const responseData = response.data?.quitsLists || [];

    const innerBaseUrl = `http://${process.env.EXT_API_PORT}:93/api/Guarantee/List`;
    const contractRespons =    await axios.get(innerBaseUrl, {
        params: { RegisterNo: registerNo},
        headers: {
          'APIkey': 'HABBVtrHLF3YV'
        }
      });
      let ContractGet =null;
      //contract data that inner filter that data which product id which match 
      let data = contractRespons.data;
      if(data){
        ContractGet  = data.filter(
          (contract) =>
            contract.ProductID == 1807060001 
        )
      }  

    for (const item of responseData) {
      const { quitsNo, quitsImages, ...claimData } = item;
      
      const existingClaim = await SendClaim.findOne({ where: { quitsNo:item.quitsNo } });
      
      for (const useRegNoForDeletingSendClaim of RegisterNoList) {
          const existingClaimAll = await SendClaim.findAll({ where: { RegisterNo: useRegNoForDeletingSendClaim } });
          
          const claimsNotInResponseData = existingClaimAll.filter(existingClaim => 
              !responseData.some(data => data.quitsNo === existingClaim.dataValues.quitsNo)
          );
          
          for (const claim of claimsNotInResponseData) {
              await QuitsImages.destroy({ where: { sendClaimId: claim.dataValues.id } });
              await SendClaim.destroy({ where: { id: claim.dataValues.id } });
              console.log("deleted records", claim.dataValues.id);
          }
       }
    

        
      
      if (!existingClaim && claimData && claimData.statusName && claimData.statusName !== " " ) {
        const newClaim = await SendClaim.create({
          status:claimData.statusName,
          riskDesc:claimData.riskDesc,
          returnDescription:claimData.returnDescription,
          f1: '',
          f2: '3',
          f3: ContractGet[0].ContractId || '',
          f4: ContractGet[0].ContractDetailId || '',
          f5: claimData.productName,
          f6: new Date().toISOString(),
          f7: new Date(claimData.calledDate).toISOString(),
          f8: new Date(claimData.riskDate).toISOString(),
          f9:'1',
          f11:user.PhoneNo,
          f12:'',
          RegisterNo: registerNo,
          quitsNo,
          productName: claimData.productName,
          beginDate: new Date(claimData.beginDate).toISOString(),
          endDate: new Date(claimData.endDate).toISOString(),
          rate: claimData.rate,
          f13: claimData.invoiceAmount
        });

        if (quitsImages && quitsImages.length > 0) {
          const quitsImagesData = quitsImages.map(image => ({
            sendClaimId: newClaim.id,
            quitsType: "other document", // Add appropriate value or field mapping for quitsType
            f1: image.f1 || ' ',
            f2: image.f2 || ' ',
            f3: image.f3 || ' '
          }));

          await QuitsImages.bulkCreate(quitsImagesData);
        }
      }
    }

  }
    // const updated = await SendClaim.findOne({ where: { RegisterNo:registerNo } });
    res.status(200).json({
      // data: updated,
      status: 'true',
      message: 'Send Claim Data Inserted Successfully',
    });
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
    res.status(500).json({
      status: 'false',
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}


cron.schedule('*/10 * * * *', async () => {
  console.log('Starting update process...');
  await updateRecords();
  await addPreviousClaim();
});


  module.exports = {
    
    login,
    verifyPassword,
    forgotPassword,
    addPreviousClaim,
    storePassword,
    resendOtp,
    otpverify,
    logout,
    currentuser,
    getClaimImg,
    guranteelist,
    quitsList,
    quitsdelete,
    sendclaim,
    updateclaim

  };
