// const prisma = require('../db/prisma');
// Authorization Middleware
// const checkPermissions = (requiredPermission) => {
//   return (req, res, next) => {
//     const Role = req.roles; // Assuming role is stored in req.roles
//     // Check if the employee's role has the required permission
//     console.log(Role);
//     const hasPermission = (Role != undefined) ? Role.map(role => { return (role.permissions) != undefined ? role.permissions.map(permission => { permission.name === requiredPermission }).some(Boolean) : null }).some(Boolean) : null;
//     console.log(hasPermission)
//     if (hasPermission) {
//       next(); // Employee has the required permission, proceed to the next middleware or route handler
//     } else {
//       res.status(403).json({ error: 'Access denied:You have not permissions' });
//     }
//   };
// }
// module.exports = { checkPermissions }


const checkPermissions = (requiredPermission) => {
  return (req, res, next) => {
    // console.log(req.Employee.roles)
    const Role = req.roles
      .map((role) => role.permissions.map((permission) => permission.name))
      .flat();
    const hasPermission = requiredPermission.every((permission) =>
      Role.includes(permission)
    );
    console.log(hasPermission)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied:You have not permissions' });
    }
    next();
  };
}
module.exports = { checkPermissions };