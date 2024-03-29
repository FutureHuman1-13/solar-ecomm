const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const registerCustomer = async (req, res) => {
    try {
        const roleId = parseInt(req.params.id);
        const { fullName, gender, dob, phone, email, password, } = req.body;
        if (!fullName || !gender || !dob || !phone || !email || !password) {
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
                roles: {
                    connect: { id: roleId }
                }
            },
            include: {
                roles: true
            }
        })
        res.status(201).json(createCustomer);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const getCustomerById = async (req, res) => {
    try {
        const CustomerId = parseInt(req.params.id);
        const Customer = await prisma.Customer.findUnique({
            where: {
                id: CustomerId
            },
            include: { roles: true }
        })
        res.status(200).json(Customer);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const getAllCustomers = async (req, res) => {
    try {
        const getUsers = await prisma.Customer.findMany({
            where:{isActive:true}
        })
        res.status(200).json(getUsers)
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const updateCustomerById = async (req, res) => {
    try {
        const CustomerId = parseInt(req.params.id);
        const Customer = await prisma.Customer.findFirst({
            where: { id: CustomerId },
        })
        if (!Customer) return res.status(400).json({ message: `Customer with ${CustomerId} not found!` });
        const { fullName, dob, gender, phone, address, email, houseNo, street, landmark, pincode, city, state } = req.body;

        if (!fullName || !dob || !gender || !phone || !email || !pincode || !city || !state) return res.status(400).json({ messsage: "Please Fill Mendatory Field's!" })

        // Split and rearrange the "dd/mm/yyyy" date input to "yyyy-mm-dd" format for a DateTime object
        const [day, month, year] = dob.split('/');
        const formattedDOB = `${year}-${month}-${day}`;
        if (req.uploadedFiles) {
            const CustomerUpdate = await prisma.Customer.update({
                where: { id: CustomerId },
                data: {
                    fullName,
                    dob: new Date(formattedDOB),// Convert the formatted date to a JavaScript Date object
                    gender,
                    phone,
                    email,
                    address,
                    houseNo,
                    street,
                    landmark,
                    pincode: parseInt(pincode),
                    city,
                    state,
                    fileName: req.uploadedFiles[0].name,
                    url: req.uploadedFiles[0].url,
                }
            })
            res.status(200).json(CustomerUpdate);
        } else {
            const CustomerUpdate = await prisma.Customer.update({
                where: { id: CustomerId },
                data: {
                    fullName,
                    dob: new Date(formattedDOB),// Convert the formatted date to a JavaScript Date object
                    gender,
                    phone,
                    email,
                    address,
                    houseNo,
                    street,
                    landmark,
                    pincode: parseInt(pincode),
                    city,
                    state,
                }
            })
            res.status(200).json(CustomerUpdate);
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ err: "Internal Server Error!" })
    }
}

const updateCustomerRoleStatus = async (req, res) => {
    try {
        const { ids } = req.params;
        const [CustomerId, roleId] = ids.split('-');
        const Customer = await prisma.Customer.findFirst({
            where: { id: parseInt(CustomerId) }
        })
        if (!Customer) return res.status(404).json({ message: "Customer Not Found!" })
        const updateRole = await prisma.Customer.update({
            where: {
                id: parseInt(CustomerId)
            },
            data: {
                roles: { connect: { id: parseInt(roleId) } }
            },
            include: { roles: true }
        })
        res.status(200).json(updateRole);
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const activeInactiveCustomer = async(req,res)=>{
    try{
        const customerId = parseInt(req.params.id);
        const customer = await prisma.Customer.findFirst({
            where: { id: customerId }
        })
        if (!customer) return res.status(404).json({ message: "customer not found!" })
        if (customer.isActive === true) {
            const customerDeactivate = await prisma.Customer.update({
                where: { id: customerId },
                data: {
                    isActive: false
                }
            })
            res.status(200).json(customerDeactivate);
        } else {
            const customerActivate = await prisma.Customer.update({
                where: { id: customerId },
                data: {
                    isActive: true
                }
            })
            res.status(200).json(customerActivate);
        }
    }catch(err){
        console.log(err);
        res.status(500).json({ Error: "Internal Server Error!" })
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
        res.status(200).json(deleteComplete);
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const deleteAllCustomer = async (req, res) => {
    try {
        const deleteComplete = await prisma.Customer.deleteMany({});
        res.status(200).json(deleteComplete);
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ Error: "Internal Server Error!" })    
    }
}

module.exports = { registerCustomer, getCustomerById, updateCustomerById, deleteCustomerById, getAllCustomers, deleteAllCustomer, updateCustomerRoleStatus,activeInactiveCustomer };