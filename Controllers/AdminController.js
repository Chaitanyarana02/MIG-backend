const { Admin, User} = require('../models');
const { getNewUserData  } = require('../Response/AdminResponse.js');
const { paginate } = require('../Response/Pagination');
const { validationResult } = require('express-validator');

async function store(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { LastName, Name, RegisterNumber, PhoneNo } = req.body;
    const newAdmin = await Admin.create({ LastName, Name, RegisterNumber, PhoneNo });
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
            if (!currentUser || currentUser.userType !== '1') {
                return res.status(401).json({ 
                    status: 'false',
                    statusCode: 401,
                    message: 'You don`t have permission to access' });
            }
        const page = req.query.page || 1; 
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 15;
        const offset = (page - 1) * perPage;

        const { count, rows: admins } = await Admin.findAndCountAll({
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
        const paginationData = paginate(admins, count, parseInt(page), perPage, 'http://localhost:3011/api/get-admins');

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



module.exports = { 
    store,
    getadmins,
    editadmin
};