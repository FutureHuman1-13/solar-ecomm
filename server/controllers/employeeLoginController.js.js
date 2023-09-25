const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
require('dotenv').config();

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are mendatory!" })//not found
        const userLogin = await prisma.User.findUnique({
            where: { email },
            include:{roles:true},
        });
        if (!userLogin) return res.sendStatus(401)//unauthorize.
        const match = await bcrypt.compare(password, userLogin.password);
        if (!match) return res.status(403).json({ message: "Invalid email and password!" })//forbidden
        if (userLogin) {
            const roles = Object.values(userLogin.roles)
            //create jwt
            const accessToken = jwt.sign({
                "userInfo": {
                    "id":userLogin.id,
                    "email": userLogin.email,
                    "roles": roles
                },
            }, process.env.ACCESS_TOKEN,
                {
                    expiresIn: '5m'
                })

            const refreshToken = jwt.sign({
                "userInfo": {
                    "name": userLogin.email
                }
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })

            const result = await prisma.User.update({
                where: { email, },
                data: {
                    refreshToken: refreshToken
                }
            });
            console.log(result);

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: "None",
                // secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000//7 days
            })
            const userDetails = {
                userName: userLogin.fullName,
                email: userLogin.email,
                phone: userLogin.phone,
                gender: userLogin.gender,
                userId: userLogin.id
            }
            return res.json({ accessToken, userDetails })
        }
    } catch (err) {
        res.json(err.message);
    }
}
const userLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204)//no content
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.json({ message: "Cookie Cleared!" });
};
module.exports = { userLogin, userLogout,};