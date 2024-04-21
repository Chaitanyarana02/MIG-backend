const getNewUserData  = (Customer) => ({
    id: Customer.id,
    UserId  : Customer.UserId,
    FirstName: Customer.FirstName || "",
    LastName: Customer.LastName || "",
    RegisterNo: Customer.RegisterNo || "",
    PhoneNo: Customer.PhoneNo || "",
    IsForigner: Customer.IsForigner || "",
    CivilWarCertificate: Customer.CivilWarCertificate || "",
    IdentitybackCertificate: Customer.IdentitybackCertificate || "",
    VehicleCertificate: Customer.VehicleCertificate || "",
    SteeringWheelCertificate: Customer.SteeringWheelCertificate || "",
    DrivingLinceseback: Customer.DrivingLinceseback || "",
    updatedAt: Customer.updatedAt || "",
    createdAt: Customer.createdAt || "",
  });
  
  module.exports = {
    getNewUserData 
  };