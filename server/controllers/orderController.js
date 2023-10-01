const prisma = require("../db/prisma");

const buyNowOrder = async (req, res) => {
    const { ids } = req.params;
    const [customerId, productId] = ids.split('-');
    const { quantity, fullName, phone, houseNo, street, fullAddress, landmark, pincode, city, state,type } = req.body;
    const customer = await prisma.Customer.findUnique({
        where: { id: parseInt(customerId) },
        // include:{mycart:true},
    })
    const product = await prisma.Product.findUnique({
        where: { id: parseInt(productId) },
        // include:{mycart:true},
    })
    if (!product || !customer) return res.status(404).json({ message: "product Not Found!" })

    if (!fullName || !quantity || !phone || !pincode || !city || !state) return res.status(400).json({ messsage: "Please Fill Mendatory Field's!" })
    const CustomerAddressDetails = await prisma.Customer.findFirst({
        where: { id: parseInt(customerId) },
        select: {
            fullName: true,
            phone: true,
            houseNo: true,
            street: true,
            pincode: true,
            landmark: true,
            city: true,
            state: true,
            address:true
        }
    })

    if(type==="Billing"){
        const billingAddress = await prisma.Addresses.create({
            data:{
                fullName,
                phone,
                houseNo,
                street,
                pincode,
                landmark,
                city,
                state,
                fullAddress,
                type:"Billing"
            }
        })
    }else{
        const billingAddress = await prisma.Addresses.create({
            data:{
                ...CustomerAddressDetails,
                fullAddress:CustomerAddressDetails.address,
                type:"Billing"
            }
        })
    }

    if(type==="Shipping"){
        const shippingAddress = await prisma.Addresses.create({
            data:{
                fullName,
                phone,
                houseNo,
                street,
                pincode,
                landmark,
                city,
                state,
                fullAddress,
                type:"Shipping"
            }
        })
    }else{
        const shippingAddress = await prisma.Addresses.create({
            data:{
                ...CustomerAddressDetails,
                fullAddress:CustomerAddressDetails.address,
                type:"Shipping"
            }
        })
    }

    const Order = await prisma.Order.create({
        data: {
            quantity: quantity,
            customerId: parseInt(customerId),
            productId: parseInt(productId),
            billingAddressId: billingAddress.id,
            shippingAddressId: shippingAddress.id,
        },
        include: {
            billingAddressId: true,
            shippingAddressId: true,
        },
    })
    res.status(201).json(Order)
}

const getBuyOrder = async (req, res) => {
    const { ids } = req.params;
    // const {quantity}= req.body;
    const [customerId, productId] = ids.split('-');
    const customer = await prisma.Customer.findUnique({
        where: { id: parseInt(customerId) },
    })
    const product = await prisma.Product.findUnique({
        where: { id: parseInt(productId) },
    })
    if (!product || !customer) return res.status(404).json({
        message: "Product Not Found!"
    })
    const productItem = await prisma.Order.findFirst({
        where: {
            customerId: parseInt(customerId),
            productId: parseInt(productId),
        }
    })
    if (product.quantity >= productItem.quantity) {
        const productOrder = await prisma.Order.findUnique({
            where: {
                id: productItem.id,
            },
            include: {
                product: true,
                address: true
            },
        })
        res.status(201).json(productOrder);
    } else {
        res.status(404).json({ message: "Please select available quantity of product!" });
    }
}

const updateOrderStatus = async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    if (!orderId) return res.status(404).json({ message: "customer record were not found!" })
    const statusUpdate = await prisma.Order.update({
        where: { id: orderId },
        data: {
            status: status
        }
    })
    res.status(201).json(statusUpdate);
}

const adminOrderDetails = async (req, res) => {
    const orderDetails = await prisma.Order.findMany({
        include: {
            address: true,
            product: true
        }
    })
    res.status(201).json(orderDetails)
}

const customerOrderDetails = async (req, res) => {
    const { customerId } = req.params.id;
    const orderDetails = await prisma.Order.findMany({
        where: { customerId: customerId },
        include: {
            address: true,
            product: true
        }

    })
    res.status(201).json(orderDetails)
}

const customerOrderCancel = async (req, res) => {
    const orderId = parseInt(req.params.id);
    if (!orderId) return res.status(404).json({ message: "Order not Found!" })
    const orderCancel = await prisma.Order.update({
        where: { id: orderId },
        data: {
            status: "Order Cancel"
        }
    })
    res.status(201).json(orderCancel);
}

module.exports = { buyNowOrder, getBuyOrder, updateOrderStatus, adminOrderDetails, customerOrderDetails, customerOrderCancel }