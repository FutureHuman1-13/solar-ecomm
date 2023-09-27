const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.get("/roles",adminController.listRoles)
router.get("/permissions",adminController.listPermissions)
router.post("/role/creation",adminController.createRole)
router.post("/permission/creation", adminController.createPermission)
router.put("/roleToPermission/creation", adminController.assignPermissionToRole)
router.put("/update/permission/:id", adminController.updatePermission)
router.put("/update/role/:id", adminController.updateRole)
// router.delete("/permission/deletion/:id", adminController.deletePermission)
// router.delete("/role/deletion/:id", adminController.deleteRole)

module.exports = router;