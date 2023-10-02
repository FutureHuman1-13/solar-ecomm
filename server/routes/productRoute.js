const express = require('express');
const router = express.Router();
const productController = require("../controllers/productController");
const fileupload = require("../middleware/fileuploadV2")
const checkPermissionRole = require("../middleware/checkPermissionRole")

const verifyJwt = require('../middleware/verifyJwt');

router.get("/getAll",
    verifyJwt,
    checkPermissionRole.checkPermissions(["View-Product"]),
    productController.getAllProducts)
router.get("/get/:id",
    verifyJwt,
    checkPermissionRole.checkPermissions(["View-Product"]),
    productController.getProductById)
router.get("/seller/:id",
    verifyJwt,
    checkPermissionRole.checkPermissions(["ViewProducts-BySeller"]),
    productController.getAllProductsBySeller)
router.get("/seller/:ids",
    verifyJwt,
    checkPermissionRole.checkPermissions(["ViewProduct-BySeller"]),
    productController.getProductBySeller)
router.post("/create/:ids",
    verifyJwt,
    checkPermissionRole.checkPermissions(["Create-Product"]),
    fileupload.upload.any(),
    fileupload.uploadImagesToFirebase,
    productController.createNewProduct)
router.put("/update/:ids",
    verifyJwt,
    checkPermissionRole.checkPermissions(["Seller-Product-Update"]),
    fileupload.upload.any(),
    fileupload.uploadImagesToFirebaseUpdate,
    productController.updateProductBySeller)
router.put("/particular/:id",
    verifyJwt,
    checkPermissionRole.checkPermissions(["Update-Product"]),
    fileupload.upload.any(),
    fileupload.uploadImagesToFirebaseUpdate,
    productController.updateParticularProduct)
router.put("/seller/:ids",
    verifyJwt,
    checkPermissionRole.checkPermissions(["ActiveInactiveProduct-BySeller"]),
    productController.ActiveInactiveProductBySeller)
router.delete("/delete/:id",
    verifyJwt,
    checkPermissionRole.checkPermissions(["Delete-Product"]),
    productController.deleteProductById)
// router.delete("/", productController.deleteAllProducts)

module.exports = router;