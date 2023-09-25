// const prisma = require('../db/prisma');
// Authorization Middleware
const checkPermissions=(permission)=> { 
    return (req, res, next) => {
      const Role = (req.Employee.roles||req.Customer.roles||req.Seller.roles); // Assuming role is stored in req.user
      // Check if the user's role has the required permission
      if (Role.permissions.includes(permission)) {
        next(); // User has the required permission, proceed to the next middleware or route handler
      } else {
        res.status(403).json({ error: 'Access denied:You have not permissions' });
      }
    };
  }
  module.exports = {checkPermissions}