const jwt = require('jsonwebtoken')
require('dotenv').config
// const prisma = require('../db/prisma');

const verifyJwt = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);//unauthorize
        console.log(authHeader);//bearer token
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN,
            async(err, decoded) => {
                if (err) return res.sendStatus(403)//forbidden-invalid token
                req.id    = decoded.userInfo.id
                req.email = decoded.userInfo.email;
                req.roles = decoded.userInfo.roles;
                // Assuming user has a 'roles' property in the JWT payload
                // req.user = await prisma.User.findUnique({
                //     where: { id: user.id },
                //     include: { roles: true },
                // });
                next();
            })
    } catch (err) {
        res.json(err.message);
    }
}
module.exports = verifyJwt;