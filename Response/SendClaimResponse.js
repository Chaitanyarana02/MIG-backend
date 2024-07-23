const getClaim = (claim) => ({
    id: claim.id,
    RegisterNo:claim.RegisterNo,
    quitsNo:claim.quitsNo,
    returenDiscription:claim.riskDesc,
    beginDate:claim.beginDate || claim.f7,
    endDate:claim.endDate || claim.f8,
    rate: claim.rate || '' ,
    phoneNo:claim.f11 ,
    productName:claim.productName || '',
    productDiscription:claim.f12,
    productId:claim.f5,
    claimAmount: claim.f13,
    updatedAt: claim.updatedAt,
    createdAt: claim.createdAt,
    statusName:claim.status,
    f1:claim.f1||'',
    f2:claim.f2||'',
    f3:claim.f3||'',
    f4:claim.f4||'',
    f7:claim.f7||'',
    f8:claim.f8||'',
    f9:claim.f9||'',
    f10:claim.f10||'',
    lastName: claim.firstName|| '',
    firstName: claim.firstName|| '',
    registerNo: claim.RegisterNo||'',
    invoiceAmount: claim.f13 ||'',
    Customer: claim ||'',
  
  });
  
  module.exports = {
    getClaim
  };