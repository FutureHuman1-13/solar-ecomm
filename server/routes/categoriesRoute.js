const express = require('express');
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

// const verifyRoles = require('../middleware/verifyRoles');
// const verifyJwt = require('../middleware/verifyJwt');

router.get("/:ids",categoriesController.getCategoriesById)
router.get("/",categoriesController.getAllCategories)
router.get("/seller/:id",categoriesController.getAllCategoriesBySeller)
router.post("/create/:id",categoriesController.createNewCategories)
router.put("/:ids",categoriesController.updateCategories)
router.delete("/:ids",categoriesController.deleteAllCategories)
router.delete("/:id",categoriesController.deleteCategoriesById)
router.delete("",categoriesController.deleteCategoriesBySeller)

module.exports = router;