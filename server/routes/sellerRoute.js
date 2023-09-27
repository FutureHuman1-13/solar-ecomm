const express = require('express');
const router = express.Router();
const sellerController = require("../controllers/sellerController");

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.post("/register/:id",sellerController.registerSeller)
router.get("/:id",sellerController.getSellerById)
router.get("/sellerlists",sellerController.getAllSellersLists)
router.put("/status",sellerController.activateInactiveSellerStatus)
router.put("/update",sellerController.updateSeller)
router.delete("/delete",sellerController.deleteSeller)

module.exports = router;