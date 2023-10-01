const employeeLoginController = require('../../controllers/authController/employeeLoginController.js');
const express = require('express');
const router = express.Router();

router.post('/employee-login',employeeLoginController.employeeLogin);
router.get('/employee-refresh',employeeLoginController.handleRefreshToken);
router.get('/employee-logout',employeeLoginController.employeeLogout);
router.post('/employee-forgot', employeeLoginController.forgotPassword);
router.post('/employee-reset/:ids', employeeLoginController.resetPassword);

module.exports = router;
