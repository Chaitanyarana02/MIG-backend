const getNewUserData = (user) => ({
    id: user.id,
    UserId:user.UserId,
    LastName: user.LastName,
    Name: user.Name? user.Name : user.FirstName,
    RegisterNumber: user.RegisterNumber ? user.RegisterNumber : user.RegisterNo,
    PhoneNo: user.PhoneNo,
    IsForigner: user.IsForigner,
    CivilWarCertificate: user.CivilWarCertificate,
    IdentitybackCertificate: user.IdentitybackCertificate,
    VehicleCertificate: user.VehicleCertificate,
    SteeringWheelCertificate: user.SteeringWheelCertificate,
    DrivingLinceseback: user.DrivingLinceseback,
    UserTypeText:user.userType,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
    isActive: user.User ? user.User.isActive : "falsee"
  });
  
  module.exports = {
    getNewUserData
  };