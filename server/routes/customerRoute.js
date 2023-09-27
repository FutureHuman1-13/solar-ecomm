const express = require('express');
const router = express.Router();
const customerController = require("../controllers/customerController");

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.get("/customer/:id",customerController.getCustomerById)
router.get("/customers",customerController.getAllCustomers)
router.post("/register/:id",customerController.registerCustomer)
router.put("/update/:id",customerController.updateCustomerById)
router.put("/update-role/:ids",customerController.updateCustomerRoleStatus)
router.delete("/delete/:id",customerController.deleteCustomerById)
router.delete("/delete",customerController.deleteAllCustomer)

module.exports = router;