const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// const checkPermissionRole = require("../middleware/checkPermissionRole");
// const verifyJwt = require('../middlewares');


router.post('/cart/add/:ids',cartController.addToCart);//add product to cart
router.get('/cart/view/:id',cartController.getCart);//view cart
router.put('/cart/decerese/:ids',cartController.decreaseFromCart);//decerease from cart
router.delete('/cart/remove/:ids',cartController.removeFromCart);//remove cart item

module.exports=router;