const prisma = require('../db/prisma');

const createNewCategories = async (req, res) => {
    try {
        const sellerId = parseInt(req.params.id);
        const { catName } = req.body;
        if (!catName) return res.status(400).json({
            message:
                "Please enter all fields details!"
        })
        const createCategories = await prisma.Categories.create({
            data: {
                catName,
                sellerId: sellerId
            }
        })
        res.status(201).json(createCategories);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message:"Inernal Server Error!"})
    }
}

const getCategoriesById = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, categoriesId] = ids.split('-');
        const getCategorie = await prisma.Categories.findUnique({
            where: {
                id: categoriesId,
                sellerId: parseInt(sellerId)
            }
        })
        res.status(201).json(getCategorie)
    } catch (err) {
        console.log(err);
    }
}

const getAllCategories = async (req, res) => {
    try {
        const getAllCategories = await prisma.Categories.findMany({})
        res.status(201).json(getAllCategories);
    } catch (err) {
        console.log(err);
    }
}

const getAllCategoriesBySeller = async (req, res) => {
    try {
        const sellerId = parseInt(req.params.id);
        const getAllCategories = await prisma.Categories.findMany({
            where: { sellerId: sellerId, }
        })
        res.status(201).json(getAllCategories);
    } catch (err) {
        console.log(err);
    }
}

const updateCategories = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, categoriesId] = ids.split('-');
        const { catName } = req.body;
        if (!catName) return res.status(400).json({
            message:
                "Please enter all fields details!"
        })
        const createCategories = await prisma.Categories.update({
            where: {
                id: parseInt(categoriesId),
                sellerId: parseInt(sellerId)
            },
            data: {
                catName,
            }
        })
        res.status(201).json(createCategories);
    } catch (err) {
        console.log(err);
    }
}

const deleteCategoriesBySeller = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, categoriesId] = ids.split('-');
        const deleteCategorie = await prisma.Categories.delete({
            where: {
                id: parseInt(categoriesId),
                sellerId: parseInt(sellerId),
            }
        })
        res.status(201).json(deleteCategorie)
    } catch (err) {
        console.log(err);
    }

}

const deleteCategoriesById = async (req, res) => {
    try {
        const categoriesId = parseInt(req.params.id);
        const deleteCategorie = await prisma.Categories.delete({
            where: {
                id: (categoriesId),
            }
        })
        res.status(201).json(deleteCategorie)
    } catch (err) {
        console.log(err);
    }

}

const deleteAllCategories = async (req, res) => {
    try {
        const deleteCategories = await prisma.Categories.deleteMany({})
        res.status(201).json(deleteCategories)
    } catch (err) {
        console.log(err);
    }
}
module.exports = { createNewCategories, updateCategories, deleteCategoriesById, deleteCategoriesBySeller, deleteAllCategories, getCategoriesById, getAllCategories, getAllCategoriesBySeller }