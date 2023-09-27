const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
require('dotenv').config();

const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are mendatory!" })//not found
        const sellerLogin = await prisma.Seller.findUnique({
            where: { email },
            include: { roles: true },
        });
        if (!sellerLogin) return res.sendStatus(401)//unauthorize.
        const match = await bcrypt.compare(password, sellerLogin.password);
        if (!match) return res.status(403).json({ message: "Invalid email and password!" })//forbidden
        if (sellerLogin) {
            const roles = Object.values(sellerLogin.roles)
            //create jwt
            const accessToken = jwt.sign({
                "id": sellerLogin.id,
                "email": sellerLogin.email,
                "roles": roles
            }, process.env.ACCESS_TOKEN,
                {
                    expiresIn: '5m'
                })

            const refreshToken = jwt.sign({
                "name": sellerLogin.email
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })

            const result = await prisma.Seller.update({
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
                userName: sellerLogin.fullName,
                email: sellerLogin.email,
                phone: sellerLogin.phone,
                gender: sellerLogin.gender,
                userId: sellerLogin.id
            }
            return res.json({ accessToken, userDetails })
        }
    } catch (err) {
        res.json(err.message);
    }
}

const sellerLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204)//no content
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.json({ message: "Cookie Cleared!" });
};

module.exports = { sellerLogin, sellerLogout, };