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
                    productImage: {
                        create: {
                            fileName: req.uploadedFiles[0].name,
                            url: req.uploadedFiles[0].url,
                        },
                    },
                },
                include: {
                    productImage: true
                }
            })
            res.status(201).json(createProduct);
        } else {
            res.json({ message: "Please Insert Product Image!" })
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error During Creation!" });
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
        res.status(500).json({ err: "Error retreving Detail!" });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const productList = await prisma.Product.findMany({})
        res.status(201).json(productList)
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error retreving Details!" });
    }
}

const getProductBySeller = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, productId] = ids.split('-');
        const getProduct = await prisma.Product.findUnique({
            where: {
                id: parseInt(productId),
                sellerId: parseInt(sellerId)
            }
        })
        res.status(201).json(getProduct);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error retreving Seller Product Detail!" });
    }
}

const getAllProductsBySeller = async (req, res) => {
    try {
        const sellerId = parseInt(req.params.id);
        const seller = await prisma.Seller.findFirst({
            where: {
                id: sellerId
            }
        })
        if (!seller) return res.status(404).json({ message: "Seller Not Found!" })
        const productList = await prisma.Product.findMany({
            where: {
                sellerId: sellerId
            }
        })
        res.status(201).json(productList)
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error retreving Seller All Products Details!" });
    }
}

const updateProductBySeller = async (req, res) => {
    try {
        const { ids } = req.params;
        const [sellerId, productId] = ids.split('-');
        const { productTitle, description, price, rating, quantity } = req.body;
        const seller = await prisma.Product.findFirst({
            where: {
                id: parseInt(productId),
                sellerId: parseInt(sellerId),
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
                    productImage: {
                        update: {
                            fileName: req.uploadedFiles[0].name,
                            url: req.uploadedFiles[0].url,
                        },
                    },
                },
                include: {
                    productImage: true
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
                    price: (price),
                    rating: (rating),
                    quantity: (quantity),
                },
                include: {
                    productImage: true
                }
            })
            res.status(201).json(updateProduct);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error Updating Product Details!" })
    }
}

const updateParticularProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { productTitle, description, price, rating, quantity } = req.body;
        const seller = await prisma.Product.findFirst({
            where: {
                id: (productId)
            }
        })
        if (!seller) return res.status(404).json({ message: "You are Not Authorize To Edit!" })
        if (req.uploadedFiles) {
            const updateProduct = await prisma.Product.update({
                where: {
                    id: (productId),
                },
                data: {
                    productTitle,
                    description,
                    price: parseInt(price),
                    rating: parseFloat(rating),
                    quantity: parseInt(quantity),
                    picture: [req.uploadedFiles[0].url],
                    productImage: {
                        update: {
                            fileName: req.uploadedFiles[0].name,
                            url: req.uploadedFiles[0].url,
                        },
                    },
                },
                include: {
                    productImage: true
                }
            })
            res.status(200).json(updateProduct);
        } else {
            const updateProduct = await prisma.Product.update({
                where: {
                    id: (productId),
                },
                data: {
                    productTitle,
                    description,
                    price: (price),
                    rating: (rating),
                    quantity: (quantity),
                },
                include: {
                    productImage: true
                }
            })
            res.status(200).json(updateProduct);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error Updating Product Details!" })
    }
}

const deleteProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const Product = await prisma.Product.findFirst({
            where: {
                id:productId
            }
        })
        if (!Product) return res.status(404).json({ message: "Product Not Found!" })
        const productDeleted = await prisma.Product.delete({
            where: {
                id: productId
            },
            include:{
                productImage:true
            }
        })
        res.status(201).json(productDeleted);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error Deleting Product!" });
    }
}

// const deleteAllProducts = async (req, res) => {
//     try {
//         const deletedAllProducts = await prisma.Product.deleteMany({})
//         res.status(201).json(deletedAllProducts)
//     } catch (err) {
//         console.log(err);
//     }
// }

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
            const inActiveProduct = await prisma.Product.update({
                where: {
                    id: parseInt(productId),
                    sellerId: parseInt(sellerId)
                },
                data: {
                    isActiveProduct: false
                }
            })
            res.status(200).json(inActiveProduct)
        } else {
            const activeProduct = await prisma.Product.update({
                where: {
                    id: parseInt(productId),
                    sellerId: parseInt(sellerId)
                },
                data: {
                    isActiveProduct: true
                }
            })
            res.status(200).json(activeProduct)
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Error Updating Status!" });
    }
}

module.exports = { createNewProduct, getAllProducts, updateProductBySeller, deleteProductById, getProductById, getAllProductsBySeller, getProductBySeller, ActiveInactiveProductBySeller, updateParticularProduct };