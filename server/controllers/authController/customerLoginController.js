const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
require('dotenv').config();

const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are mendatory!" })//not found
        const customerLogin = await prisma.Customer.findUnique({
            where: { email },
            include: { roles: { include: { permissions: true } } },
        });
        if (!customerLogin) return res.sendStatus(401)//unauthorize.
        const match = await bcrypt.compare(password, customerLogin.password);
        if (!match) return res.status(403).json({ message: "Invalid email and password!" })//forbidden
        if (customerLogin) {
            const roles = Object.values(customerLogin.roles)
            //create jwt
            const accessToken = jwt.sign({
                "id": customerLogin.id,
                "email": customerLogin.email,
                "roles": roles
            }, process.env.ACCESS_TOKEN,
                {
                    expiresIn: '5m'
                })

            const refreshToken = jwt.sign({
                "id": customerLogin.id,
                "email": customerLogin.email,
                "roles": roles
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })

            const result = await prisma.Customer.update({
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
                userName: customerLogin.fullName,
                email: customerLogin.email,
                phone: customerLogin.phone,
                gender: customerLogin.gender,
                userId: customerLogin.id
            }
            return res.status(200).json({ accessToken, userDetails })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error!" });
    }
}

const customerLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204)//no content
    const refreshToken = cookies.jwt;

    //Is refreshToken in database.
    const foundCustomer = await prisma.Customer.findFirst({
        where: { refreshToken: refreshToken }
    })
    if (foundCustomer) {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        // res.status(200).json({ message: "Cookie Cleared!" });
        const deleteRTFromDatabase = await prisma.Customer.update({
            where: { id: foundCustomer.id },
            data: { refreshToken: null }
        })
        res.status(200).json(deleteRTFromDatabase);
    } else {
        res.status(404).json({ message: "Customer Not Found!" })
    }
};

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);//unauthorize
    const refreshToken = cookies.jwt;
    const foundCustomer = await prisma.Customer.findFirst({
        where: { refreshToken: refreshToken },
        include: { roles: { include: { permissions: true } } }
    })
    if (!foundCustomer) return res.sendStatus(403)//forbidden
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async(err, decoded) => {
            if (err || foundCustomer.email !== decoded.email) return res.sendStatus(403)//forbidden
            const roles = Object.values(foundCustomer.roles);
            const accessToken = jwt.sign(
                {
                    "id": foundCustomer.id,
                    "email": foundCustomer.email,
                    "roles": roles
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: "1m" }
            )
            const refreshToken = jwt.sign({
                "id": foundCustomer.id,
                "email": foundCustomer.email,
                "roles": roles
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })
            const updateCustomer = await prisma.Customer.update({
                where: { id: foundCustomer.id },
                data: { refreshToken: refreshToken }
            })
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: "None",
                // secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000//7 days
            })
            res.status(200).json({ accessToken, result: foundCustomer })
        }
    );
}

module.exports = { customerLogin, customerLogout, handleRefreshToken };