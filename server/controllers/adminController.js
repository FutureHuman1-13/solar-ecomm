const prisma = require('../db/prisma');

const createRole = async (req, res) => {
    try {
        const { name } = req.body;
        const role = await prisma.Role.create({
            data: {
                name,
            },
        });
        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message:"Role creation failed" });
    }
}

const createPermission = async (req, res) => {
    try {
        const { name } = req.body;
        const permission = await prisma.Permission.create({
            data: {
                name,
            },
        });
        res.json(permission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Permission creation failed" });
    }
}

// const deleteRole = async (req, res) => {
//     try {
//         const permissionId = parseInt(req.params.id);
//         const deletedRole = await prisma.Role.delete({
//             where: { id: permissionId }
//         })
//         res.status(201).json(deletedRole)
//     } catch (err) {
//         console.log(err);
//     }
// }


// const deletePermission = async (req, res) => {
//     try {
//         const permissionId = parseInt(req.params.id);
//         const deletedPermission = await prisma.Permission.delete({
//             where: { id: permissionId }
//         })
//         res.status(201).json(deletedPermission)
//     } catch (err) {
//         console.log(err);
//     }
// }

const updatePermission = async (req, res) => {
    try {
        const permissionId = parseInt(req.parmas.id);
        const { name } = req.body;
        const updatedPermission = await prisma.Permission.update({
            where: { id: permissionId },
            data: {
                name,
            }
        })
        res.status(201).json(updatedPermission)
    } catch (err) {
        console.log(err);
    }
}

const listRoles = async (req, res) => {
    try {
        const roles = await prisma.Role.findMany();
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const listPermissions = async (req, res) => {
    try {
        const permissions = await prisma.Permission.findMany();
        res.json(permissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const assignPermissionToRole = async (req, res) => {
    try {
        const { roleId, permissionId } = req.body;
        const role = await prisma.Role.update({
            where: { id: roleId },
            data: {
                permissions: {
                    connect: {
                        id: permissionId,
                    },
                },
                rolePermission: {
                    create: {
                        permissionId,
                    },
                },
            },
            include:{rolePermission:true}
        });
        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Permission assignment failed" });
    }
}

module.exports = {
    createRole, createPermission, assignPermissionToRole, listRoles, listPermissions, updatePermission,
};
