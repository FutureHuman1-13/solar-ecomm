const express = require('express');
const router = express.Router();
const customerController = require("../controllers/customerController");
const fileupload = require("../middleware/fileuploadV2")

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.get("/customer/:id",customerController.getCustomerById)
router.get("/customers",customerController.getAllCustomers)
router.post("/register/:id",customerController.registerCustomer)
router.put("/update/:id",
fileupload.upload.any(),
fileupload.uploadImagesToFirebase,
customerController.updateCustomerById)
router.put("/update-role/:ids",customerController.updateCustomerRoleStatus)
router.put("/activeInactive/:id",customerController.activeInactiveCustomer)
router.delete("/delete/:id",customerController.deleteCustomerById)
router.delete("/delete",customerController.deleteAllCustomer)

module.exports = router;