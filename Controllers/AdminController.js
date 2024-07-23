const { Admin, User ,Customer ,QuitsImages} = require('../models');
const { getNewUserData  } = require('../Response/AdminResponse.js');
const { paginate } = require('../Response/Pagination');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const axios = require('axios');


async function store(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
        return res.status(401).json({ 
            status: 'false',
            statusCode: 401,
            message: 'You don`t have permission to access' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { LastName, Name, RegisterNumber, PhoneNo } = req.body;
    const userId = req.user.id;
    const newAdmin = await Admin.create({ LastName, Name, RegisterNumber, PhoneNo, UserId: userId});
    await User.create({ phoneNo: PhoneNo, userType:"1" ,isActive:true });
    const data = getNewUserData(newAdmin);
    res.status(201).json({ 
        data: data,
        status: 'true',
        statusCode: 200,
        message: 'Manager registered successfully' });
    } catch (error) {
        console.error('Error occurred while creating admin:', error);
        res.status(500).json({
            status: 'false',
            statusCode: 500, 
            message: 'Internal server error' });
    }
}

async function getadmins(req, res) {
    try {
        const currentUser = req.user;
            if (!currentUser || currentUser.userType !== '2') {
                return res.status(401).json({ 
                    status: 'false',
                    statusCode: 401,
                    message: 'You don`t have permission to access' });
            }
        const page = req.query.page || 1; 
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 15;
        const offset = (page - 1) * perPage;
        let whereCondition = {};
        if (req.query.PhoneNo || req.query.Name || req.query.LastName || req.query.RegisterNumber) {
            whereCondition = {
                ...(req.query.Name && { Name: { [Op.like]: `%${req.query.Name}%` } }),
                ...(req.query.LastName && { LastName: { [Op.like]: `%${req.query.LastName}%` } }),
                ...(req.query.RegisterNumber && { RegisterNumber: { [Op.like]: `%${req.query.RegisterNumber}%` } }),
                ...(req.query.PhoneNo && { PhoneNo: { [Op.like]: `%${req.query.PhoneNo}%` } }),
            };
        }    
        const order = req.query.order === 'desc' ? 'DESC' : 'ASC';


        const { count, rows: admins } = await Admin.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', order]],

            limit: perPage,
            offset: offset
        });

        if (admins.length === 0) {
            return res.status(404).json({
                status: 'false',
                statusCode: 404,
                message: 'No admins Available'
            });
        }
        const mappedAdmins = admins.map(admin => getNewUserData(admin));

        const paginationData = paginate(mappedAdmins, count, parseInt(page), perPage, `${process.env.DOMAIN}/api/get-admins`);
        

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

async function getAdminsAndUsers(req, res) {
    try {
        const currentUser = req.user;
        if (!currentUser ) {
            return res.status(401).json({
                status: 'false',
                statusCode: 401,
                message: 'You don’t have permission to access'
            });
        }

        const page = req.query.page || 1;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 15;
        const offset = (page - 1) * perPage;

        let adminWhereCondition = {};
        let userWhereCondition = {};
        if (req.query.PhoneNo || req.query.Name || req.query.LastName || req.query.RegisterNumber) {
            adminWhereCondition = {
                ...(req.query.Name && { Name: { [Op.like]: `%${req.query.Name}%` } }),
                ...(req.query.LastName && { LastName: { [Op.like]: `%${req.query.LastName}%` } }),
                ...(req.query.RegisterNumber && { RegisterNumber: { [Op.like]: `%${req.query.RegisterNumber}%` } }),
                ...(req.query.PhoneNo && { PhoneNo: { [Op.like]: `%${req.query.PhoneNo}%` } }),
            };

            userWhereCondition = {
                ...(req.query.Name && { FirstName: { [Op.like]: `%${req.query.Name}%` } }),
                ...(req.query.LastName && { LastName: { [Op.like]: `%${req.query.LastName}%` } }),
                ...(req.query.RegisterNumber && { RegisterNo: { [Op.like]: `%${req.query.RegisterNumber}%` } }),
                ...(req.query.PhoneNo && { PhoneNo: { [Op.like]: `%${req.query.PhoneNo}%` } }),
            };

        }

        const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

        // Fetch admins
        const { count: adminCount, rows: admins } = await Admin.findAndCountAll({
            where: adminWhereCondition,
            order: [['createdAt', order]],
            limit: perPage,
            offset: offset
        });

        // Fetch users
        const { count: userCount, rows: users } = await Customer.findAndCountAll({
            where: userWhereCondition,
            order: [['createdAt', order]],
            include: [
                {
                    model: User,
                    as: 'User',
                    required: false, 
                }
            ],      
            limit: perPage,
            offset: offset
        });

        // Merge admins and users
        const combinedData = [
            ...admins.map(admin => ({ ...admin.get(), userType: 'Manager'  })),
            ...users.map(user => ({ ...user.get(), userType: 'User'  }))
        ];

        const totalCount = adminCount + userCount;

        if (combinedData.length === 0) {
            return res.status(404).json({
                status: 'false',
                statusCode: 404,
                message: 'No admins or users available'
            });
        }

        // Map data
        const mappedData = combinedData.map(item => getNewUserData(item));

        // Apply pagination
        const paginationData = paginate(mappedData, totalCount, parseInt(page), perPage, `${process.env.DOMAIN}/api/get-admins`);

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

async function editadmin(req, res) {
    try {
        const currentUser = req.user;
        if (!currentUser ) {
            return res.status(401).json({ 
                status: 'false',
                statusCode: 401,
                message: 'You don`t have permission to access' });
        }
        

        const { PhoneNo } = req.body;

        const admin = await Admin.findOne({ where: { PhoneNo: currentUser.phoneNo } });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.PhoneNo = PhoneNo || admin.PhoneNo;
        await admin.save();
        const user = await User.findOne({ where: { phoneNo: currentUser.phoneNo } });
        if (user) {
            user.phoneNo = req.body.PhoneNo || user.phoneNo;
            await user.save();
        }
        res.status(200).json({
            data: admin,
            status: 'true',
            statusCode: 200,
            message: 'Admin updated successfully'
        });
    } catch (error) {
        console.error('Error occurred while updating admin details:', error);
        res.status(500).json({
            status: 'false',
            statusCode: 500,
            message: 'Internal server error'
        });
    }
}

async function showadmin(req, res) {
    try {
        
        const currentUser = req.user;
        if (!currentUser || currentUser.userType !== '2') {
            return res.status(401).json({ 
                status: 'false',
                statusCode: 401,
                message: 'You don`t have permission to access' });
        }

        const adminId = req.params.id;

        const admin = await Admin.findByPk(adminId);

        if (!admin) {
            return res.status(404).json({
                status: 'false',
                statusCode: 404,
                message: 'Admin not found'
            });
        }
        const data = getNewUserData(admin);

        res.status(200).json({
            data: data,
            status: 'true',
            statusCode: 200,
            message: 'Admin get Successfully'
        });
    } catch (error) {
        console.error('Error fetching admin:', error);
        res.status(500).json({
            status: 'false',
            statusCode: 500,
            message: 'Internal server error'
        });
    }
}

async function currentadmin(req, res) {
    try {
      const currentUser = req.user;
      if (!currentUser) {
          return res.status(401).json({ 
              status: 'false',
              statusCode: 401,
              message: 'You don`t have permission to access' });
      }
      const phoneNo = req.user.phoneNo ? req.user.phoneNo : '99009900' ;
      const manager = await Admin.findOne({ where: { PhoneNo: phoneNo } });

    //   if (!manager) {
    //     return res.status(404).json({ 
    //       status: 'false',
    //       statusCode: 404,
    //       message: 'Manager not found' });
    //   }
      const responseData = getNewUserData(manager);
      res.json({ 
        manager: responseData, 
        user: currentUser,
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

  async function getImg(req, res)  {
    const { name } = req.params;
    const imageUrl = `http://localhost:3012/certificate/${name}`;
  
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
  
      res.set('Content-Type', 'image/*');
      res.send(imageBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching image' });
    }
  };

  async function getclaimsImg(req, res)  {
    const { name } = req.params;
    const imageUrl = `http://localhost:3012/sendclaim/${name}`;
  
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
  
      res.set('Content-Type', 'image/*');
      res.send(imageBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching image' });
    }
  };



  async function deleteAdmin(req,res) {

    const { phoneNo } = req.body;
    if (!phoneNo) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
    try {
        const admin = await Admin.findOne({ where: { phoneNo: {
                                                                [Op.not]: '99009900'
                                                              } 
                                                  }       });
        if (!admin) {
        return res.status(404).json({ message: 'This admin cannot be deleted ' });
        }

        const user = await User.findOne({ where: { phoneNo , userType: {
            [Op.notIn]: ['0', '2']
          } } });

          if (!user) {
            return res.status(404).json({ message: 'You don\'t have permission' });
          }

        await admin.destroy();
        await user.destroy();
        return res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while trying to delete the admin' });
    }


  }


module.exports = { 
    store,
    getadmins,
    deleteAdmin,
    getClaimImg,
    getImg,
    getclaimsImg,
    getAdminsAndUsers,
    editadmin,
    showadmin,
    currentadmin
};