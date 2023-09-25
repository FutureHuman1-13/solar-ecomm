const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const registerSeller = async (req, res) => {
    try {
        const { fullName, gender, dob, phone, email,password} = req.body;
        if (!fullName, !gender, !dob, !phone, !email, password) {
            return res.status(400).json({ message: "All fields are mendatory!" })
        }
        // Split and rearrange the "dd/mm/yyyy" date input to "yyyy-mm-dd" format for a DateTime object
        const [day, month, year] = dob.split('/');
        const formattedDOB = `${year}-${month}-${day}`;
        const duplicate = await prisma.Seller.findMany({
            where: {
                email,
                phone
            },
        })//if duplicate
        if (duplicate.length > 0) return res.status(409).json({ message: "Duplicate Seller!" })//conflict
        const hashedPassword = await bcrypt.hash(password, 10);
        const createSeller = await prisma.Seller.create({
            data: {
                fullName,
                gender,
                dob: new Date(formattedDOB),// Convert the formatted date to a JavaScript Date object
                phone,
                email,
                password: hashedPassword,
                roles:"Seller"
            }
        })
        res.json(createSeller);
    } catch (err) {
        console.log(err.message);
    }
}

const getSellerById = async (req, res) => {
    try {
        const SellerId = parseInt(req.params.id);
        const Seller = await prisma.Seller.findUnique({
            where: {
                id: SellerId
            },
        })
        res.json(Seller);
    } catch (err) {
        console.log(err.message);
    }
}

const getAllSellersLists = async (req, res) => {
    try {
        const { page, perPage } = req.query; // Get the desired page from the query
        const skip = (page - 1) * perPage;// Calculate the number of items to skip based on the page number and items per page

        // Retrieve Sellers with pagination
        const Sellers = await prisma.Seller.findMany({
            skip: skip,
            take: parseInt(perPage),
        });
        res.json(Sellers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving Sellers' });
    }
}

const activateInactiveSellerStatus = async (req, res) => {
    try {
        const sellerId = parseInt(req.params.id);
        const seller = await prisma.Seller.findFirst({
            where:{id:sellerId}
        })
        if(!seller) return res.status(404).json({message:"seller not found!"})
        if(seller.isActive ===true){
            const sellerDeactivate = await prisma.Seller.update({
                where: { id: sellerId },
                data: {
                    isActive: false
                }
            })
            res.status(201).json(sellerDeactivate);
        }else{
            const sellerActivate = await prisma.Seller.update({
                where: { id: sellerId },
                data: {
                    isActive: false
                }
            })
            res.status(201).json(sellerActivate);
        } 
    } catch (err) {
        console.log(err);
    }
}

const updateSeller = async (req, res) => {
    try {
        const SellerId = parseInt(req.params.id);
        const Seller = await prisma.Seller.findFirst({
            where: { id: SellerId }
        })
        if (!Seller) return res.status(400).json({ message: `${SellerId} not found!` });
        const { fullName, dob, gender, phone, address, email, houseNo, street, landmark, pincode, city, state } = req.body;
        // Split and rearrange the "dd/mm/yyyy" date input to "yyyy-mm-dd" format for a DateTime object
        const [day, month, year] = dob.split('/');
        const formattedDOB = `${year}-${month}-${day}`;
        // const hashedPassword = await bcrypt.hash(password, 10);
        const SellerUpdate = await prisma.Seller.update({
            where: { id: SellerId },
            data: {
                fullName,
                dob: new Date(formattedDOB),// Convert the formatted date to a JavaScript Date object
                gender,
                phone,
                email,
                addresses:{
                    create:{
                        fullName,
                        phone,
                        houseNo,
                        street,
                        landmark,
                        pincode,
                        address,
                        city,
                        state
                    }
                }
            }
        })
        res.json(SellerUpdate);
    } catch (err) {
        console.log(err.message);
    }
}

const deleteSeller = async (req, res) => {
    try {
        const sellerId = parseInt(req.params.id);
        const deleteComplete = await prisma.Seller.delete({
            where: {
                id: sellerId
            }
        });
        res.json(deleteComplete);
    } catch (err) {
        console.log(err.message)
    }
}

module.exports = { registerSeller, getSellerById, updateSeller, deleteSeller, getAllSellersLists, activateInactiveSellerStatus };