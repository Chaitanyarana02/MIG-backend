const { Admin, User} = require('../models');
const { getNewUserData  } = require('../Response/AdminResponse.js');
const { paginate } = require('../Response/Pagination');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');


async function store(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.userType !== '2') {
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
    await User.create({ phoneNo: PhoneNo, userType:"1" });
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

        const paginationData = paginate(mappedAdmins, count, parseInt(page), perPage, 'http://localhost:3011/api/get-admins');
        

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
        if (!currentUser || currentUser.userType !== '1') {
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
      if (!currentUser || currentUser.userType !== '1') {
          return res.status(401).json({ 
              status: 'false',
              statusCode: 401,
              message: 'You don`t have permission to access' });
      }
      const phoneNo = req.user.phoneNo;
      const manager = await Admin.findOne({ where: { PhoneNo: phoneNo } });

      if (!manager) {
        return res.status(404).json({ 
          status: 'false',
          statusCode: 404,
          message: 'Manager not found' });
      }
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



module.exports = { 
    store,
    getadmins,
    editadmin,
    showadmin,
    currentadmin
};