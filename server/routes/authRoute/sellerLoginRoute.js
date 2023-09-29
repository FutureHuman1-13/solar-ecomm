const express = require('express');
const router = express.Router();
const sellerLoginController = require('../../controllers/authController/sellerLoginController')

router.post('/seller-login',sellerLoginController.sellerLogin);
// router.get('/admin/refresh',sellerLoginController.loginRefresh);
router.get('/seller-logout',sellerLoginController.sellerLogout);
// router.post('/admin-forgot-password', sellerLoginController.forgotPassword);
// router.post('/admin-reset-password', sellerLoginController.resetPassword);

module.exports = router;
