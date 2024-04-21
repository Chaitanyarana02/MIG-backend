const getNewUserData = (user) => ({
    id: user.id,
    LastName: user.LastName,
    Name: user.Name,
    RegisterNumber: user.RegisterNumber,
    PhoneNo: user.PhoneNo,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  });
  
  module.exports = {
    getNewUserData
  };