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
        const duplicate = await prisma.Employee.findMany({
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
                roles: {
                    connect: { id: roleId }
                }
            },
            include: {
                roles: true
            }
        })
        res.status(201).json(createEmployee);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const getEmployeeById = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const Employee = await prisma.Employee.findUnique({
            where: {
                id: employeeId
            },
            include: { roles: true }
        })
        res.status(200).json(Employee);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const getAllEmployees = async (req, res) => {
    try {
        const getUsers = await prisma.Employee.findMany({
            where:{isActive:true}
        })
        res.status(200).json(getUsers)
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: "Internal Server Error!" })
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

        if (!fullName || !dob || !gender || !phone || !email || !pincode || !city || !state) return res.status(400).json({ messsage: "Please Fill Mendatory Field's!" })

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
        res.status(200).json(employeeUpdate);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

const activeInactiveEmployee = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const employee = await prisma.Employee.findFirst({
            where: { id: employeeId }
        })
        if (!employee) return res.status(404).json({ message: "employee not found!" })
        if (employee.isActive === true) {
            const employeeDeactivate = await prisma.Employee.update({
                where: { id: employeeId },
                data: {
                    isActive: false
                }
            })
            res.status(200).json(employeeDeactivate);
        } else {
            const employeeActivate = await prisma.Employee.update({
                where: { id: employeeId },
                data: {
                    isActive: true
                }
            })
            res.status(200).json(employeeActivate);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error Updating employee Status' });
    }

}

const updateEmployeeRoleStatus = async (req, res) => {
    try {
        const { ids } = req.params;
        const [employeeId, roleId] = ids.split('-');
        const employee = await prisma.Employee.findFirst({
            where: { id: parseInt(employeeId) }
        })
        if (!employee) return res.status(404).json({ message: "Employee Not Found!" })
        const updateRole = await prisma.Employee.update({
            where: {
                id: parseInt(employeeId)
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

const deleteEmployeeById = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const deleteComplete = await prisma.Employee.delete({
            where: {
                id: employeeId
            }
        });
        res.status(200).json(deleteComplete);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ Error: "Internal Server Error!" })
    }
}

// const deleteAllEmployee = async (req, res) => {
//     try {
//         const deleteComplete = await prisma.Employee.deleteMany({});
//         res.json(deleteComplete);
//     } catch (err) {
//         console.log(err.message)
//     }
// }

module.exports = { registerEmployee, getEmployeeById, updateEmployee,activeInactiveEmployee, deleteEmployeeById, getAllEmployees,updateEmployeeRoleStatus };