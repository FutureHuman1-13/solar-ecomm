const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
require('dotenv').config();

const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are mendatory!" })//not found
        const sellerLogin = await prisma.Seller.findUnique({
            where: { email },
            include: { roles:{include:{permissions :true }}},
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
                "id": sellerLogin.id,
                "email": sellerLogin.email,
                "roles": roles
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
            return res.status(200).json({ accessToken, userDetails })
        }
    } catch (err) {
        res.json(err.message);
    }
}

const sellerLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204)//no content
    const refreshToken = cookies.jwt;

    //Is refreshToken in database.
    const foundUser = await prisma.Seller.findFirst({
        where:{refreshToken:refreshToken}
    })
    if(foundUser){
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        // res.status(200).json({ message: "Cookie Cleared!" });
        const deleteRTFromDatabase = await prisma.Seller.update({
            where:{id:foundUser.id},
            data:{refreshToken:null}
        })
        res.status(200).json(deleteRTFromDatabase);
    }else{
        res.status(404).json({message:"seller Not Found!"})
    } 
};

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);//unauthorize
    const refreshToken = cookies.jwt;
    const foundSeller = await prisma.Seller.findFirst({
        where: { refreshToken: refreshToken },
        include: { roles:{include:{permissions :true }}}
    })
    if (!foundSeller) return res.sendStatus(403)//forbidden
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async(err, decoded) => {
            if (err || foundSeller.email !== decoded.email) return res.sendStatus(403)//forbidden
            const roles = Object.values(foundSeller.roles);
            const accessToken = jwt.sign(
                {
                    "id": foundSeller.id,
                    "email": foundSeller.email,
                    "roles": roles
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: "5m" }
            )
            const refreshToken = jwt.sign({
                "id": foundSeller.id,
                "email": foundSeller.email,
                "roles": roles
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })
            const updateSeller = await prisma.Seller.update({
                where:{id:foundSeller.id},
                data:{refreshToken:refreshToken}
            })
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: "None",
                // secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000//7 days
            })
            res.status(200).json({accessToken,result:foundSeller})
        }
    );
}
module.exports = { sellerLogin, sellerLogout, handleRefreshToken};