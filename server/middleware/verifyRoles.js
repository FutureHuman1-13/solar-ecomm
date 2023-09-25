// const verifyRoles = (...allowedRoles)=>{
//     return (req,res,next)=>{
//         if(!req?.User?.roles) return res.sendStatus(401)//unauthorize
//         const rolesArray = [...allowedRoles];     
//         const result = req.User.roles.map(role=>rolesArray.includes(role)).find(val=>val===true)
//         if(!result) return res.sendStatus(401);//unauthorize
//         next();
//     }
// }
// module.exports = verifyRoles;