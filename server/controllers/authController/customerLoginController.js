const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// require('dotenv').config();

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
        if (!match) return res.status(403).json({ message: "Invalid email or password!" })//forbidden
        if (customerLogin && customerLogin.isActive === true) {
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
        } else {
            return res.status(401).json({ message: "Your account has been deactivated!" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error!" });
    }
}

const customerLogout = async (req, res) => {
    try {
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
            // res.status(204).json({ message: "Cookie Cleared!" });
            const deleteRTFromDatabase = await prisma.Customer.update({
                where: { id: foundCustomer.id },
                data: { refreshToken: null }
            })
            res.status(200).json(deleteRTFromDatabase);
        } else {
            res.status(404).json({ message: "Customer Not Found!" })
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
        const foundCustomer = await prisma.Customer.findFirst({
            where: { refreshToken: refreshToken },
            include: { roles: { include: { permissions: true } } }
        })
        if (!foundCustomer) return res.sendStatus(403)//forbidden
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN,
            async (err, decoded) => {
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
                const refreshNewToken = jwt.sign({
                    "id": foundCustomer.id,
                    "email": foundCustomer.email,
                    "roles": roles
                }, process.env.REFRESH_TOKEN,
                    {
                        expiresIn: '7d'
                    })
                const updateCustomer = await prisma.Customer.update({
                    where: { id: foundCustomer.id },
                    data: { refreshToken: refreshNewToken }
                })
                res.cookie('jwt', refreshNewToken, {
                    httpOnly: true,
                    sameSite: "None",
                    // secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000//7 days
                })
                res.status(200).json({ accessToken, result: foundCustomer })
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(404).json("Please enter Correct Email!");
        const foundCustomer = await prisma.Customer.findFirst({
            where: { email: email }
        })
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 1000);//token expiry in 1mn.
        const resetLink = `https://example.com/reset-password?token=${resetToken}-${foundCustomer.id}`;
        // const emailTemplatePath = path.join(__dirname, '..', 'views', 'password_reset_user.ejs');
        // const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
        const Customer = await prisma.Customer.update({
            where: { email },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });
        res.status(200).json({ Customer });

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
        const [resetToken, customerId] = ids.split('-')
        const { newPassword, confirmPassword } = req.body;
        const Customer = await prisma.Customer.findFirst({
            where: {
                id: parseInt(customerId),
                resetToken: resetToken,
                resetTokenExpiry: {
                    gte: new Date(),
                },
            },
        });

        if (!Customer) {
            return res.status(400).json({ message: 'Invalid or expired token!' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match!" });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find the user by reset token and update the password
        const updatedUser = await prisma.Customer.update({
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

module.exports = { customerLogin, customerLogout, handleRefreshToken, resetPassword, forgotPassword };