const jwt = require('jsonwebtoken')
// require('dotenv').config
const prisma = require('../db/prisma');

const verifyJwt = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(403);//forbidden
        console.log(authHeader);//bearer token
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN,
            async(err, decoded) => {
                if (err) return res.sendStatus(403)//forbidden-invalid token
                req.id    = decoded.id
                req.email = decoded.email;
                req.roles = decoded.roles;
                // // Assuming Employee has a 'roles' property in the JWT payload
                // req.Employee = await prisma.Employee.findUnique({
                //     where: { id: Employee.id },
                //     include: { roles: { include: { permissions: true } } },
                // });
                next();
            })
    } catch (err) {
        res.json(err.message);
    }
}
module.exports = verifyJwt;