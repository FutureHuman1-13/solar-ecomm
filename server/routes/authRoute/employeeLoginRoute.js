const employeeLoginController = require('../../controllers/authController/employeeLoginController.js');
const express = require('express');
const router = express.Router();

router.post('/employee-login',employeeLoginController.employeeLogin);
router.get('/employee-refresh',employeeLoginController.handleRefreshToken);
router.get('/employee-logout',employeeLoginController.employeeLogout);
// router.post('/admin-forgot-password', employeeLoginController.forgotPassword);
// router.post('/admin-reset-password', employeeLoginController.resetPassword);

module.exports = router;
