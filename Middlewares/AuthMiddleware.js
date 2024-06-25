const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'false',
      statusCode: 401,
      message: 'Authorization Token not Found' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        status: 'false',
        statusCode: 401,
        message: 'Authorization Token not Found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error occurred while verifying token:', error);
    return res.status(401).json({ 
      status: 'false',
      statusCode: 401,
      message: 'Authorization Token not Found' });
  }
}

module.exports = authMiddleware;
