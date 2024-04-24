const { Customer, User } = require('../models');
const { validationResult } = require('express-validator');
const { getNewUserData  } = require('../Response/CustomerResponse.js');
const { paginate } = require('../Response/Pagination');
const xlsx = require('xlsx');
const upload = require('../helpers/image-uploader');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
require('dotenv').config();
const fs = require('fs');
const { Op } = require('sequelize');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION
});
const s3 = new AWS.S3();



async function store(req, res) {
    try {
        const currentUser = req.user;
        if (!currentUser || currentUser.userType == '0') {
            return res.status(401).json({ 
                status: 'false',
                statusCode: 401,
                message: 'You don`t have permission to access' });
        }

        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
        const { FirstName, LastName, RegisterNo, PhoneNo, IsForigner } = req.body;
        const {CivilWarCertificate,IdentitybackCertificate,VehicleCertificate, 
            SteeringWheelCertificate, 
            DrivingLinceseback} = req.files;
        // console.log(req.files);
        const userId = req.user.id;
        let user = await User.findOne({ where: { phoneNo: PhoneNo, UserType:0 } });
        if (!user) {
            user = await User.create({ phoneNo: PhoneNo });
        }

            const newRegisterData = {
                FirstName,
                LastName,
                RegisterNo,
                PhoneNo,
                IsForigner,
                CivilWarCertificate, 
                IdentitybackCertificate, 
                VehicleCertificate, 
                SteeringWheelCertificate, 
                DrivingLinceseback,
                UserId: userId
            };
            // console.log(newRegisterData);
            if (CivilWarCertificate) {
                const civilWarUrl = await uploadToS3(CivilWarCertificate[0]);
                newRegisterData.CivilWarCertificate = civilWarUrl;
            }

            if (IdentitybackCertificate && IdentitybackCertificate.length > 0) {
                const IdentitybackCertificateUrl = await uploadToS3(IdentitybackCertificate[0]);
                newRegisterData.IdentitybackCertificate = IdentitybackCertificateUrl;
            }

            if (VehicleCertificate) {
                const VehicleCertificateUrl = await uploadToS3(VehicleCertificate[0]);
                newRegisterData.VehicleCertificate = VehicleCertificateUrl;
            }

            if (SteeringWheelCertificate) {
                const SteeringWheelCertificateUrl = await uploadToS3(SteeringWheelCertificate[0]);
                newRegisterData.SteeringWheelCertificate = SteeringWheelCertificateUrl;
            }

            if (DrivingLinceseback) {
                const DrivingLincesebackUrl = await uploadToS3(DrivingLinceseback[0]);
                newRegisterData.DrivingLinceseback = DrivingLincesebackUrl;
            }
            const newRegister = await Customer.create(newRegisterData);

            const data = getNewUserData(newRegister);

            res.status(201).json({
                data: data,
                status: 'true',
                statusCode: 200,
                message: 'Customer registered successfully'
            });
        
        } catch (error) {
            console.error('Error occurred while storing customer:', error);
            res.status(500).json({
                status: 'false',
                statusCode: 500,
                message: 'Internal server error'
            });
        }
}
async function uploadToS3(file) {
   const extension = file.originalname.split('.').pop(); // Extract the file extension
    const key = `${file.filename}.${extension}`; // Append the extension to the file name
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: fs.createReadStream(file.path),
        ACL: 'public-read',
        ContentType: file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
}

async function get(req, res) {
    try {
        const currentUser = req.user;
        if (!currentUser || currentUser.userType == '0') {
            return res.status(401).json({ 
                status: 'false',
                statusCode: 401,
                message: 'You don`t have permission to access' });
        }
        const userId = req.user.id;
        const page = req.query.page || 1; 
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 15;
        const offset = (page - 1) * perPage;
        let whereCondition = {};
        if (req.query.PhoneNo || req.query.FirstName || req.query.LastName || req.query.RegisterNo) {
            whereCondition = {
                ...(req.query.FirstName && { FirstName: { [Op.like]: `%${req.query.FirstName}%` } }),
                ...(req.query.LastName && { LastName: { [Op.like]: `%${req.query.LastName}%` } }),
                ...(req.query.RegisterNo && { RegisterNo: { [Op.like]: `%${req.query.RegisterNo}%` } }),
                ...(req.query.PhoneNo && { PhoneNo: { [Op.like]: `%${req.query.PhoneNo}%` } }),
            };
        }    
        const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
        const { count, rows: customers } = await Customer.findAndCountAll({
            where: {
                UserId: userId,
                ...whereCondition
            },
            order: [['createdAt', order]], // Example: Order by createdAt column
            limit: perPage,
            offset: offset
        });

        if (customers.length === 0) {
            return res.status(404).json({
                status: 'false',
                statusCode: 404,
                message: 'No customers found for the user'
            });
        }
        const customerdata = customers.map(customer => getNewUserData(customer));
        const paginationData = paginate(customerdata, count, parseInt(page), perPage, 'http://localhost:3011/api/get-customers');

        res.status(200).json(paginationData);
    } catch (error) {
        console.error('message', error);
        res.status(500).json({
            status: 'false',
            statusCode: 500,
            message: 'Internal server error'
        });
    }
}

async function get_customer_details(req, res) {
    try {
        const customerId = req.user.id;
        //console.log(req.user);
    
        if (!customerId) {
          return res.status(401).json({
            status: "false",
            statusCode: 401,
            message: "User not authenticated",
          });
        }
    
        const customer = await Customer.findByPk(customerId);
    
        if (!customer) {
          return res.status(404).json({
            status: "false",
            statusCode: 404,
            message: "Customer details not found",
          });
        }
    
        return res.status(200).json({
          data: customer,
          status: "true",
          statusCode: 200,
          message: "Customer details fetched successfully",
        });
      } catch (error) {
        console.error("Error occurred while fetching customer details:", error);
        res.status(500).json({
          status: "false",
          statusCode: 500,
          message: "Internal server error",
        });
      }
}



async function storeExcel(req, res) {
    try {
        const currentUser = req.user;
        if (!currentUser || currentUser.userType == '0') {
            return res.status(401).json({ 
                status: 'false',
                statusCode: 401,
                message: 'You don`t have permission to access' });
        }
        if (!req.file) {
            return res.status(400).json({
                status: 'false',
                statusCode:'400', 
                message: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        for (const row of data) {
            const normalizedRow = Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
            );

            const LastName = normalizedRow['овог'];
            const FirstName = normalizedRow['нэр']; 
            const PhoneNo = normalizedRow['утасны дугаар'];
            const RegisterNo = normalizedRow['регистрийн дугаар'];
            let user = await User.findOne({ where: { phoneNo: PhoneNo } });
            if (!user) {
                user = await User.create({ phoneNo: PhoneNo });
            }
            await Customer.create({
                FirstName,
                LastName,
                PhoneNo,
                RegisterNo,
                UserId: req.user.id
            });
        }

        return res.status(200).json({
            status: 'true',
            statusCode:'200', 
            message: 'Successfully Uploaded' });
            } catch (error) {
        console.error('Error occurred while storing data:', error);
            res.status(500).json({  
            status: 'false',
            statusCode:'500', 
            message: 'Please check your field' 
    });
    }
}
async function edit(req, res) {
    try {
        const currentUser = req.user;
        if (!currentUser || currentUser.userType !== '0') {
            return res.status(401).json({ 
                status: 'false',
                statusCode: 401,
                message: 'You don`t have permission to access' });
        }

        const customer = await Customer.findOne({ where: { PhoneNo: currentUser.phoneNo } });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Check if any keys are provided in the request body
        if (Object.keys(req.body).length === 0) {
            // No keys provided, return the current customer data
            return res.status(200).json({
                data: customer,
                status: 'true',
                statusCode: 200,
                message: 'Customer details fetched successfully'
            });
        }

        // Update the customer's details if new data is provided
        if (req.body.FirstName !== undefined) {
            customer.FirstName = req.body.FirstName;
        }
        if (req.body.LastName !== undefined) {
            customer.LastName = req.body.LastName;
        }
        if (req.body.RegisterNo !== undefined) {
            customer.RegisterNo = req.body.RegisterNo;
        }
        if (req.body.PhoneNo !== undefined) {
            customer.PhoneNo = req.body.PhoneNo;
        }
        if (req.body.IsForigner !== undefined) {
            customer.IsForigner = req.body.IsForigner;
        }

        // Update the certificates if new files are provided
        if (req.files.CivilWarCertificate) {
            const civilWarUrl = await uploadToS3(req.files.CivilWarCertificate[0]);
            customer.CivilWarCertificate = civilWarUrl;
        }
        if (req.files.IdentitybackCertificate) {
            const IdentitybackCertificateUrl = await uploadToS3(req.files.IdentitybackCertificate[0]);
            customer.IdentitybackCertificate = IdentitybackCertificateUrl;  
        }
        if (req.files.VehicleCertificate) {
            const VehicleCertificateUrl = await uploadToS3(req.files.VehicleCertificate[0]);
            customer.VehicleCertificate = VehicleCertificateUrl;  
        }
        if (req.files.SteeringWheelCertificate) {
            const SteeringWheelCertificateUrl = await uploadToS3(req.files.SteeringWheelCertificate[0]);
            customer.SteeringWheelCertificate = SteeringWheelCertificateUrl;
        }
        if (req.files.DrivingLinceseback) {
            const DrivingLincesebackUrl = await uploadToS3(req.files.DrivingLinceseback[0]);
            customer.DrivingLinceseback = DrivingLincesebackUrl;
        }
        await customer.save();
        const user = await User.findOne({ where: { phoneNo: currentUser.phoneNo } });
        // console.log(user);
    if (user) {
        user.phoneNo = req.body.PhoneNo || user.phoneNo;
        await user.save();
    }
        res.status(200).json({
            data: customer,
            status: 'true',
            statusCode: 200,
            message: 'Customer details updated successfully'
        });
    } catch (error) {
        console.error('Error occurred while updating customer details:', error);
        res.status(500).json({
            status: 'false',
            statusCode: 500,
            message: 'Internal server error'
        });

    }

}

module.exports = {
    store,
    get,
    storeExcel,
    edit,
    get_customer_details
};
