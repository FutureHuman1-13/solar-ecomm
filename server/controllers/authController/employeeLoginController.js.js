const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
require('dotenv').config();

const employeeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are mendatory!" })//not found
        const employeeLogin = await prisma.Employee.findUnique({
            where: { email },
            include: { roles:{include:{permissions :true }}},
        });
        if (!employeeLogin) return res.sendStatus(401)//unauthorize.
        const match = await bcrypt.compare(password, employeeLogin.password);
        if (!match) return res.status(403).json({ message: "Invalid email and password!" })//forbidden
        if (employeeLogin) {
            const roles = Object.values(employeeLogin.roles)
            //create jwt
            const accessToken = jwt.sign({
                "id": employeeLogin.id,
                "email": employeeLogin.email,
                "roles": roles
            }, process.env.ACCESS_TOKEN,
                {
                    expiresIn: '5m'
                })

            const refreshToken = jwt.sign({
                "id": employeeLogin.id,
                "email": employeeLogin.email,
                "roles": roles
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })

            const result = await prisma.Employee.update({
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
            const employeeDetails = {
                employeeName: employeeLogin.fullName,
                email: employeeLogin.email,
                phone: employeeLogin.phone,
                gender: employeeLogin.gender,
                employeeId: employeeLogin.id
            }
            return res.status(200).json({ accessToken, employeeDetails })
        }
    } catch (err) {
        res.json(err.message);
    }
}
const employeeLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204)//no content
    const refreshToken = cookies.jwt;

    //Is refreshToken in database.
    const foundUser = await prisma.Employee.findFirst({
        where:{refreshToken:refreshToken}
    })
    if(foundUser){
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        // res.status(200).json({ message: "Cookie Cleared!" });
        const deleteRTFromDatabase = await prisma.Employee.update({
            where:{id:foundUser.id},
            data:{refreshToken:null}
        })
        res.status(200).json(deleteRTFromDatabase);
    }else{
        res.status(404).json({message:"employee Not Found!"})
    } 
};
const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);//unauthorize
    const refreshToken = cookies.jwt;
    const foundEmployee = await prisma.Employee.findFirst({
        where: { refreshToken: refreshToken },
        include: { roles:{include:{permissions :true }}}
    })
    if (!foundEmployee) return res.sendStatus(403)//forbidden
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async(err, decoded) => {
            if (err || foundEmployee.email !== decoded.email) return res.sendStatus(403)//forbidden
            const roles = Object.values(foundEmployee.roles);
            const accessToken = jwt.sign(
                {
                    "id": foundEmployee.id,
                    "email": foundEmployee.email,
                    "roles": roles
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: "1m" }
            )
            const refreshToken = jwt.sign({
                "id": foundEmployee.id,
                "email": foundEmployee.email,
                "roles": roles
            }, process.env.REFRESH_TOKEN,
                {
                    expiresIn: '7d'
                })
            const updateEmployee = await prisma.Employee.update({
                where:{id:foundEmployee.id},
                data:{refreshToken:refreshToken}
            })
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: "None",
                // secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000//7 days
            })
            res.status(200).json({accessToken,result:foundEmployee})
        });
}
module.exports = { employeeLogin, employeeLogout,handleRefreshToken };