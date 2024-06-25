const getNewUserData = (user) =>  {
  let userTypeText = '';
  if (user.userType === "0") {
    userTypeText = 'Customer';
  } else if (user.userType === "1") {
    userTypeText = 'Manager';
  } else if (user.userType === "2") {
    userTypeText = 'SuperAdmin';
  }
  
  return {
    id: user.id,
    otp: user.otp,
    phoneNo: user.phoneNo,
    isOtpVerified: user.isOtpVerified,
    userType: user.userType,
    userTypeText: userTypeText,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  };
};
  
  module.exports = {
    getNewUserData
  };