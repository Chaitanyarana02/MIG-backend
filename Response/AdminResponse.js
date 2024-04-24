const getNewUserData = (user) => ({
    id: user.id,
    UserId:user.UserId,
    LastName: user.LastName,
    Name: user.Name,
    RegisterNumber: user.RegisterNumber,
    PhoneNo: user.PhoneNo,
    UserTypeText:"Manager",
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  });
  
  module.exports = {
    getNewUserData
  };