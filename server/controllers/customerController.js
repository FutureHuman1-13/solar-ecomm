const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const registerCustomer = async (req, res) => {
    try {
        const roleId = parseInt(req.params.id);
        const { fullName, gender, dob, phone, email, password, } = req.body;
        if (!fullName, !gender, !dob, !phone, !email, !password) {
            return res.status(400).json({ message: "All fields are mendatory!" })
        }
        // Split and rearrange the "dd/mm/yyyy" date input to "yyyy-mm-dd" format for a DateTime object
        const [day, month, year] = dob.split('/');
        const formattedDOB = `${year}-${month}-${day}`;
        const duplicate = await prisma.Customer.findMany({
            where: {
                email,
                phone
            },
        })//if duplicate
        if (duplicate.length > 0) return res.status(409).json({ message: "Duplicate User!" })//conflict
        const hashedPassword = await bcrypt.hash(password, 10);
        const createCustomer = await prisma.Customer.create({
            data: {
                fullName,
                gender,
                dob: new Date(formattedDOB),// Convert the formatted date to a JavaScript Date object
                phone,
                email,
                password: hashedPassword,
                roles:{
                    connect:{id:roleId}
                }
            },
            include:{
                roles:true
            }
        })
        res.json(createCustomer);
    } catch (err) {
        console.log(err.message);
    }
}

const getCustomerById = async (req, res) => {
    try {
        const CustomerId = parseInt(req.params.id);
        const Customer = await prisma.Customer.findUnique({
            where: {
                id: CustomerId
            },
            include:{roles:true}
        })
        res.json(Customer);
    } catch (err) {
        console.log(err.message);
    }
}

const getAllCustomers = async (req, res) => {
    try {
        const getUsers = await prisma.Customer.findMany({})
        res.status(201).json(getUsers)
    } catch (err) {
        console.log(err);
    }
}

const updateCustomerById = async (req, res) => {
    try {
        const CustomerId = parseInt(req.params.id);
        const Customer = await prisma.Customer.findFirst({
            where: { id: CustomerId }
        })
        if (!Customer) return res.status(400).json({ message: `Customer with ${CustomerId} not found!` });
        const { fullName, dob, gender, phone, address, email, houseNo, street, landmark, pincode, city, state } = req.body;
        // Split and rearrange the "dd/mm/yyyy" date input to "yyyy-mm-dd" format for a DateTime object
        const [day, month, year] = dob.split('/');
        const formattedDOB = `${year}-${month}-${day}`;
        const CustomerUpdate = await prisma.Customer.update({
            where: { id: CustomerId },
            data: {
                fullName,
                dob: new Date(formattedDOB),// Convert the formatted date to a JavaScript Date object
                gender,
                phone,
                email,
                addresses: {
                    create: {
                        fullName,
                        phone,
                        address,
                        houseNo,
                        street,
                        landmark,
                        pincode,
                        city,
                        state
                    }
                }
            }
        })
        res.json(CustomerUpdate);

    } catch (err) {
        console.log(err.message);
    }
}

const updateCustomerRoleStatus = async(req,res)=>{
    try{
            const {ids} = req.params;
            const [CustomerId,roleId] = ids.split('-');
            const Customer = await prisma.Customer.findFirst({
                where:{id:parseInt(CustomerId)}
            })
            if(!Customer) return res.status(404).json({message:"Customer Not Found!"})
            const updateRole = await prisma.Customer.update({
                where:{
                    id:parseInt(CustomerId)
                },
                data:{
                    roles:{connect:{id:parseInt(roleId)}}
                },
                include:{roles:true}
            })
            res.status(200).json(updateRole);
    }catch(err){
        console.log(err);
    }
}

const deleteCustomerById = async (req, res) => {
    try {
        const CustomerId = parseInt(req.params.id);
        const deleteComplete = await prisma.Customer.delete({
            where: {
                id: CustomerId
            }
        });
        res.json(deleteComplete);
    } catch (err) {
        console.log(err.message)
    }
}

const deleteAllCustomer = async (req, res) => {
    try {
        const deleteComplete = await prisma.Customer.deleteMany({});
        res.json(deleteComplete);
    } catch (err) {
        console.log(err.message)
    }
}

module.exports = { registerCustomer, getCustomerById, updateCustomerById, deleteCustomerById, getAllCustomers,deleteAllCustomer,updateCustomerRoleStatus };