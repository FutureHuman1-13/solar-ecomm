const express = require('express');
const router = express.Router();
const employeeController = require("../controllers/employeeController");

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.get("/employee/:id",employeeController.getEmployeeById)
router.get("/employees",employeeController.getAllEmployees)
router.post("/register/:id",employeeController.registerEmployee)
router.put("/update/:id",employeeController.updateEmployee)
router.put("/update-role/:ids",employeeController.updateEmployeeRoleStatus)
router.put("/activeInactive/:id",employeeController.activeInactiveEmployee)
router.delete("/delete/:id",employeeController.deleteEmployeeById)
// router.delete("/delete",employeeController.deleteAllEmployee)

module.exports = router;