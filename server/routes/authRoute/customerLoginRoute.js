const express = require('express');
const router = express.Router();
const customerLoginController = require('../../controllers/authController/customerLoginController');

router.post('/customer-login',customerLoginController.customerLogin);
router.get('/customer-refresh',customerLoginController.handleRefreshToken);
router.get('/customer-logout',customerLoginController.customerLogout);
// router.post('/admin-forgot-password', customerLoginController.forgotPassword);
// router.post('/admin-reset-password', customerLoginController.resetPassword);

module.exports = router;
