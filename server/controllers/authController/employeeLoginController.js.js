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
            include: { roles: { include: { permissions: true } } },
        });
        if (!employeeLogin) return res.sendStatus(401)//unauthorize.
        const match = await bcrypt.compare(password, employeeLogin.password);
        if (!match) return res.status(403).json({ message: "Invalid email and password!" })//forbidden
        if (employeeLogin && employeeLogin.isActive === true) {
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
        } else {
            return res.status(401).json({ message: "You are not Login!" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const employeeLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204)//no content
        const refreshToken = cookies.jwt;

        //Is refreshToken in database.
        const foundUser = await prisma.Employee.findFirst({
            where: { refreshToken: refreshToken }
        })
        if (foundUser) {
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: "None",
                secure: true,
            });
            // res.status(200).json({ message: "Cookie Cleared!" });
            const deleteRTFromDatabase = await prisma.Employee.update({
                where: { id: foundUser.id },
                data: { refreshToken: null }
            })
            res.status(200).json(deleteRTFromDatabase);
        } else {
            res.status(404).json({ message: "employee Not Found!" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }

};

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);//unauthorize
        const refreshToken = cookies.jwt;
        const foundEmployee = await prisma.Employee.findFirst({
            where: { refreshToken: refreshToken },
            include: { roles: { include: { permissions: true } } }
        })
        if (!foundEmployee) return res.sendStatus(403)//forbidden
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN,
            async (err, decoded) => {
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
                const refreshNewToken = jwt.sign({
                    "id": foundEmployee.id,
                    "email": foundEmployee.email,
                    "roles": roles
                }, process.env.REFRESH_TOKEN,
                    {
                        expiresIn: '7d'
                    })
                const updateEmployee = await prisma.Employee.update({
                    where: { id: foundEmployee.id },
                    data: { refreshToken: refreshNewToken }
                })
                res.cookie('jwt', refreshNewToken, {
                    httpOnly: true,
                    sameSite: "None",
                    // secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000//7 days
                })
                res.status(200).json({ accessToken, result: foundEmployee })
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(404).json("Please enter Correct Email!");
        const foundEmployee = await prisma.Employee.findFirst({
            where: { email: email }
        })
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 1000);//token expiry in 1mn.
        const resetLink = `https://example.com/reset-password?token=${resetToken}-${foundEmployee.id}`;
        // const emailTemplatePath = path.join(__dirname, '..', 'views', 'password_reset_user.ejs');
        // const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
        const Employee = await prisma.Employee.update({
            where: { email },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });
        res.status(200).json({ Employee });

        //send an email with  a link to reset the password. 
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_ADMIN,
                pass: process.env.EMAIL_ADMIN_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_ADMIN,
            to: email,
            subject: 'Password Reset',
            text: resetLink,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log(info);
                res.status(200).json({ message: 'Password reset email sent successfully!' });
            }
        });
    }
    catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { ids } = req.params;
        const [resetToken, EmployeeId] = ids.split('-')
        const { newPassword, confirmPassword } = req.body;
        const Employee = await prisma.Employee.findFirst({
            where: {
                id: parseInt(EmployeeId),
                resetToken: resetToken,
                resetTokenExpiry: {
                    gte: new Date(),
                },
            },
        });

        if (!Employee) {
            return res.status(400).json({ message: 'Invalid or expired token!' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match!" });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find the user by reset token and update the password
        const updatedUser = await prisma.Employee.update({
            where: { resetToken },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            },
        });

        res.status(200).json({ updatedUser, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}
module.exports = { employeeLogin, employeeLogout, handleRefreshToken, forgotPassword, resetPassword };