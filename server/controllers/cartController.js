const prisma = require('../db/prisma');


const addToCart = async (req, res) => {
    try {
        const { ids } = req.params;
        const [customerId, productId] = ids.split('-');
        const { quantity } = req.body;
        const customer = await prisma.Customer.findUnique({
            where: { id: parseInt(customerId) },
            // include:{Cart:true},
        })
        const product = await prisma.Product.findUnique({
            where: { id: parseInt(productId) },
            // include:{Cart:true},
        })
        if (!product || !customer) return res.status(404).json({ message: "Product not Found!" });

        const cartItem = await prisma.Cart.findFirst({
            where: {
                customerId: parseInt(customerId),
                productId: parseInt(productId)
            },
        });
        if (!cartItem) {
            const productAdd = await prisma.Cart.create({
                data: {
                    quantity: quantity,
                    productId: parseInt(productId),
                    customerId: parseInt(customerId),
                },
            })
            res.status(201).json(productAdd);
        } else {
            const productUpdate = await prisma.Cart.update({
                where: {
                    id: cartItem.id
                },
                data: {
                    quantity: (cartItem.quantity + 1)
                }
            })
            res.status(201).json(productUpdate);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Inernal Server Error!" })
    }
}

const getCart = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const cartItem = await prisma.Cart.findFirst({
            where: {
                customerId: parseInt(customerId),
            },
        });
        if (!cartItem) return res.status(404).json({ message: "Product Not found Please add Product!" })
        const getCartProducts = await prisma.Cart.findMany({
            where: { customerId: customerId },
            include: { product: true }
        })
        res.status(201).json(getCartProducts);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Inernal Server Error!" })
    }
}

const decreaseFromCart = async (req, res) => {
    try {
        const { ids } = req.params;
        const [customerId, productId] = ids.split('-');
        const cartItem = await prisma.Cart.findFirst({
            where: {
                customerId: parseInt(customerId),
                productId: parseInt(productId)
            },
        })
        if (cartItem) {
            if (cartItem.quantity > 1) {
                const cartProduct = await prisma.Cart.update({
                    where: { id: cartItem.id },
                    data: {
                        quantity: cartItem.quantity - 1,
                    }
                })
                res.status(200).json(cartProduct);
            } else {
                res.status(404).json({ message: "Not Possible!" })
            }
        }else{
            res.status(404).json({ message: "Please Add Product To Cart!" })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Inernal Server Error!" })
    }
}

const removeFromCart = async (req, res) => {
    try {
        const { ids } = req.params;
        const [customerId, productId] = ids.split('-');
        const cartItem = await prisma.Cart.findFirst({
            where: {
                customerId: parseInt(customerId),
                productId: parseInt(productId)
            },
        })
        if (!cartItem) return res.status(404).json({ message: "Product Already Removed!" })
        const removeCart = await prisma.Cart.delete({
            where: {
                id: cartItem.id
            }
        })
        res.status(200).json(removeCart);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Inernal Server Error!" })
    }
}

module.exports = { addToCart, decreaseFromCart, removeFromCart, getCart };