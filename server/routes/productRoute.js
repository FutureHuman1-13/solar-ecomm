const express = require('express');
const router = express.Router();
const productController = require("../controllers/productController");
const fileupload = require("../middleware/fileuploadV2")

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.get("/", productController.getAllProducts)
router.get("/:ids", productController.getProductById)
router.get("/", productController.getAllProductsSeller)
router.get("/:ids", productController.getProductBySeller)
router.post("/create/:ids",
    fileupload.upload.any(),
    fileupload.uploadImagesToFirebase,
    productController.createNewProduct)
router.put("/:ids",
    fileupload.upload.any(),
    fileupload.uploadImagesToFirebaseUpdate,
    productController.updateProduct)
router.put("/seller?:ids", productController.ActiveInactiveProductBySeller)
router.delete("/:ids", productController.deleteProductById)
router.delete("/", productController.deleteAllProducts)

module.exports = router;