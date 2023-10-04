const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are mendatory!" })//not found
        const sellerLogin = await prisma.Seller.findUnique({
            where: { email },
            include: { roles: { include: { permissions: true } } },
        });
        if (!sellerLogin) return res.sendStatus(401)//unauthorize.
        const match = await bcrypt.compare(password, sellerLogin.password);
        if (!match) return res.status(403).json({ message: "Invalid email and password!" })//forbidden
        if (sellerLogin && sellerLogin.isActive === true) {
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
        } else {
            return res.status(401).json({ message: "Your account has been deactivated!" })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const sellerLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204)//no content
        const refreshToken = cookies.jwt;

        //Is refreshToken in database.
        const foundUser = await prisma.Seller.findFirst({
            where: { refreshToken: refreshToken }
        })
        if (foundUser) {
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: "None",
                secure: true,
            });
            // res.status(200).json({ message: "Cookie Cleared!" });
            const deleteRTFromDatabase = await prisma.Seller.update({
                where: { id: foundUser.id },
                data: { refreshToken: null }
            })
            res.status(200).json(deleteRTFromDatabase);
        } else {
            res.status(404).json({ message: "seller Not Found!" })
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

};

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);//unauthorize
        const refreshToken = cookies.jwt;
        const foundSeller = await prisma.Seller.findFirst({
            where: { refreshToken: refreshToken },
            include: { roles: { include: { permissions: true } } }
        })
        if (!foundSeller) return res.sendStatus(403)//forbidden
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN,
            async (err, decoded) => {
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
                const refreshNewToken = jwt.sign({
                    "id": foundSeller.id,
                    "email": foundSeller.email,
                    "roles": roles
                }, process.env.REFRESH_TOKEN,
                    {
                        expiresIn: '7d'
                    })
                const updateSeller = await prisma.Seller.update({
                    where: { id: foundSeller.id },
                    data: { refreshToken: refreshNewToken }
                })
                res.cookie('jwt', refreshNewToken, {
                    httpOnly: true,
                    sameSite: "None",
                    // secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000//7 days
                })
                res.status(200).json({ accessToken, result: foundSeller })
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
        const foundSeller = await prisma.Seller.findFirst({
            where: { email: email }
        })
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 1000);//token expiry in 1mn.
        const resetLink = `https://example.com/reset-password?token=${resetToken}-${foundSeller.id}`;
        // const emailTemplatePath = path.join(__dirname, '..', 'views', 'password_reset_user.ejs');
        // const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
        const Seller = await prisma.Seller.update({
            where: { email },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });
        res.status(200).json({ Seller });

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
        const [resetToken, SellerId] = ids.split('-')
        const { newPassword, confirmPassword } = req.body;
        const Seller = await prisma.Seller.findFirst({
            where: {
                id: parseInt(SellerId),
                resetToken: resetToken,
                resetTokenExpiry: {
                    gte: new Date(),
                },
            },
        });

        if (!Seller) {
            return res.status(400).json({ message: 'Invalid or expired token!' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match!" });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find the user by reset token and update the password
        const updatedUser = await prisma.Seller.update({
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
module.exports = { sellerLogin, sellerLogout, handleRefreshToken, forgotPassword, resetPassword };