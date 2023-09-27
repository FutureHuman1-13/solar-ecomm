const prisma = require('../db/prisma');

const createNewProduct = async (req, res) => {
    try {
        console.log(req.uploadedFiles)
        const { ids } = req.params;
        const [sellerId, categoriesId] = ids.split('-');
        const { productTitle, description, price, rating, quantity } = req.body;
        if (!productTitle, !description, !price, !rating, !quantity) {
            return res.status(400).json({ message: "All Fields are mendatory!" });
        }
        if (req.uploadedFiles) {
            const createProduct = await prisma.Product.create({
                data: {
                    productTitle,
                    description,
                    price: parseInt(price),
                    rating: parseFloat(rating),
                    quantity: parseInt(quantity),
                    picture: [req.uploadedFiles[0].url],
                    categoriesId: parseInt(categoriesId),
                    sellerId: parseInt(sellerId),
                    productimage: {
                        create: {
                            fileName: req.uploadedFiles[0].name,
                            url: req.uploadedFiles[0].url,
                        },
                    },
                },
                include: {
                    productimage: true
                }
            })
            res.status(201).json(createProduct);
        } else {
            res.json({ message: "Please Insert Product Image!" })
        }

    } catch (err) {
        console.log(err);
    }
}

const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const getProduct = await prisma.Product.findUnique({
            where: { id: productId }
        })
        res.status(201).json(getProduct);
    } catch (err) {
        console.log(err);
    }
}

const getAllProducts = async (req, res) => {
    try {
        const productList = await prisma.Product.findMany({})
        res.status(201).json(productList)
    } catch (err) {
        console.log(err);
    }
}

const getAllProductsSeller = async (req, res) => {
    try {
        const { sellerId } = parseInt(req.params.id);
        const productList = await prisma.Product.findMany({
            where: {
                sellerId: sellerId,
            }
        })
        res.status(201).json(productList)
    } catch (err) {
        console.log(err);
    }
}

const getProductBySeller = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, productId] = ids.split('-');
        const getProduct = await prisma.Product.findUnique({
            where: {
                id: productId,
                sellerId: parseInt(sellerId)
            }
        })
        res.status(201).json(getProduct);
    }
    catch (err) {
        console.log(err);
    }
}

const updateProduct = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, productId] = ids.split('-');
        const { productTitle, description, price, rating, quantity } = req.body;
        const seller = await prisma.Product.findFirst({
            where: {
                sellerId: parseInt(sellerId),
                productId: parseInt(productId)
            }
        })
        if (!seller) return res.status(404).json({ message: "You are Not Authorize To Edit!" })
        if (req.uploadedFiles) {
            const updateProduct = await prisma.Product.update({
                where: {
                    id: parseInt(productId),
                    sellerId: parseInt(sellerId)
                },
                data: {
                    productTitle,
                    description,
                    price: parseInt(price),
                    rating: parseFloat(rating),
                    quantity: parseInt(quantity),
                    picture: [req.uploadedFiles[0].url],
                    productimage: {
                        update: {
                            fileName: req.uploadedFiles[0].name,
                            url: req.uploadedFiles[0].url,
                        },
                    },
                },
                include: {
                    productimage: true
                }
            })
            res.status(201).json(updateProduct);
        } else {
            const updateProduct = await prisma.Product.update({
                where: {
                    id: parseInt(productId),
                    sellerId: parseInt(sellerId)
                },
                data: {
                    productTitle,
                    description,
                    price: parseInt(price),
                    rating: parseFloat(rating),
                    quantity: parseInt(quantity),
                },
                include: {
                    productimage: true
                }
            })
            res.status(201).json(updateProduct);
        }
    } catch (err) {
        console.log(err)
    }
}

const deleteProductById = async (req, res) => {
    try {
        const { ids } = req.params;
        const [productId] = ids.split('-');
        const Product = await prisma.Product.findFirst({
            where: {
                productId: parseInt(productId)
            }
        })
        if (!Product) return res.status(404).json({ message: "Product Not Found!" })
        const productDeleted = await prisma.Product.delete({
            where: {
                id: productId
            }
        })
        res.status(201).json(productDeleted);
    } catch (err) {
        console.log(err);
    }
}

const deleteAllProducts = async (req, res) => {
    try {
        const deletedAllProducts = await prisma.Product.deleteMany({})
        res.status(201).json(deletedAllProducts)
    } catch (err) {
        console.log(err);
    }
}

// const ActiveInactiveAllProductsBySeller = async (req, res) => {
//     try {
//         const sellerId = parseInt(req.params.id);
//         const seller = await prisma.Product.findFirst({
//             where: { id: sellerId }
//         })
//         if (!seller) return res.status(203).json({ message: "You Are Not Authorize!" })
//         if (seller.isActiveProduct === true) {
//             const inactiveProducts = await prisma.Product.updateMany({
//                 where: { sellerId: sellerId },
//                 data: { isActiveProduct: false }
//             })
//             res.status(201).json(inactiveProducts)
//         } else {
//             const activeProducts = await prisma.Product.updateMany({
//                 where: { sellerId: sellerId },
//                 data: { isActiveProduct: true }
//             })
//             res.status(201).json(activeProducts)
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }

const ActiveInactiveProductBySeller = async (req, res) => {
    try {
        const { ids } = req.params;;
        const [sellerId, productId] = ids.split('-');
        const seller = await prisma.Product.findFirst({
            where: {
                id: parseInt(productId),
                sellerId: parseInt(sellerId)
            }
        })
        if (!seller) return res.status(203).json({ message: "You are not Authorize!" })
        if (seller.isActiveProduct === true) {
            const activeProduct = await prisma.Product.update({
                where: {
                    id: parseInt(productId),
                    seller: parseInt(sellerId)
                },
                data: {
                    isActiveProduct: false
                }
            })
            res.status(200).json(activeProduct)
        } else {
            const inactiveProduct = await prisma.Product.update({
                where: {
                    id: parseInt(productId),
                    seller: parseInt(sellerId)
                },
                data: {
                    isActiveProduct: false
                }
            })
            res.status(200).json(inactiveProduct)
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = { createNewProduct, getAllProducts, updateProduct, deleteProductById, deleteAllProducts, getProductById, getAllProductsSeller, getProductBySeller, ActiveInactiveProductBySeller };