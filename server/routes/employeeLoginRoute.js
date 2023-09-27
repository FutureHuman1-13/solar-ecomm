const employeeLoginController = require('../controllers/employeeLoginController.js.js');
const express = require('express');
const router = express.Router();

router.post('/admin-login',employeeLoginController.employeeLogin);
// router.get('/admin/refresh',employeeLoginController.loginRefresh);
router.get('/admin-logout',employeeLoginController.employeeLogout);
// router.post('/admin-forgot-password', employeeLoginController.forgotPassword);
// router.post('/admin-reset-password', employeeLoginController.resetPassword);

module.exports = router;
