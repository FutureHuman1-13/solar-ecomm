const express = require('express');
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const checkPermissionRole = require("../middleware/checkPermissionRole")

// const verifyRoles = require('../middleware/verifyRoles');
const verifyJwt = require('../middleware/verifyJwt');

router.post("/register/:id", sellerController.registerSeller)
router.get("/get/:id",
    verifyJwt,
    checkPermissionRole.checkPermissions(["View-Seller"]),
    sellerController.getSellerById)
router.get("/sellerlists",
    verifyJwt,
    checkPermissionRole.checkPermissions(["View-Sellers"]),
    sellerController.getAllSellersLists)
router.put("/activeInactive/:id",
    verifyJwt,
        checkPermissionRole.checkPermissions(["ActiveInactive-Seller"]),
    sellerController.activateInactiveSellerStatus)
router.put("/update",
    verifyJwt,
    sellerController.updateSeller)
router.delete("/delete",
    verifyJwt,
    checkPermissionRole.checkPermissions(["View-Product"]),
    sellerController.deleteSeller)

module.exports = router;