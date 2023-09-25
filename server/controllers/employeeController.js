const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const registerEmployee = async (req, res) => {
    try {
        const roleId = parseInt(req.params.id);
        const { fullName, gender, dob, phone, email, password, } = req.body;
        if (!fullName, !gender, !dob, !phone, !email, !password) {
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
        if (duplicate.length > 0) return res.status(409).json({ message: "Duplicate User!" })//conflict
        const hashedPassword = await bcrypt.hash(password, 10);
        const createEmployee = await prisma.Employee.create({
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
        res.json(createEmployee);
    } catch (err) {
        console.log(err.message);
    }
}

const getEmployeeById = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const Employee = await prisma.Employee.findUnique({
            where: {
                id: employeeId
            },
            include:{roles:true}
        })
        res.json(Employee);
    } catch (err) {
        console.log(err.message);
    }
}

const getAllEmployees = async (req, res) => {
    try {
        const getUsers = await prisma.Employee.findMany({})
        res.status(201).json(getUsers)
    } catch (err) {
        console.log(err);
    }
}

const updateEmployee = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const employee = await prisma.Employee.findFirst({
            where: { id: employeeId }
        })
        if (!employee) return res.status(400).json({ message: `Employee with ${employeeId} not found!` });
        const { fullName, dob, gender, phone, address, email, houseNo, street, landmark, pincode, city, state } = req.body;
        // Split and rearrange the "dd/mm/yyyy" date input to "yyyy-mm-dd" format for a DateTime object
        const [day, month, year] = dob.split('/');
        const formattedDOB = `${year}-${month}-${day}`;
        const employeeUpdate = await prisma.Employee.update({
            where: { id: employeeId },
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
        res.json(employeeUpdate);

    } catch (err) {
        console.log(err.message);
    }
}

const updateEmployeeRoleStatus = async(req,res)=>{
    try{
            const {ids} = req.params;
            const [employeeId,roleId] = ids.split('-');
            const employee = await prisma.Employee.findFirst({
                where:{id:employeeId}
            })
            if(!employee) return res.status(404).json({message:"Employee Not Found!"})
            const updateRole = await prisma.Employee.update({
                where:{
                    id:employeeId
                },
                data:{
                    roles:{connsect:{id:roleId}}
                }
            })
            res.status(200).json(updateRole);
    }catch(err){
        console.log(err);
    }
}

const deleteEmployeeById = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const deleteComplete = await prisma.Employee.delete({
            where: {
                id: employeeId
            }
        });
        res.json(deleteComplete);
    } catch (err) {
        console.log(err.message)
    }
}

const deleteAllEmployee = async (req, res) => {
    try {
        const deleteComplete = await prisma.Employee.deleteMany({});
        res.json(deleteComplete);
    } catch (err) {
        console.log(err.message)
    }
}

module.exports = { registerEmployee, getEmployeeById, updateEmployee, deleteEmployeeById, getAllEmployees,deleteAllEmployee,updateEmployeeRoleStatus };