const { Role } = require('../src/app/models/index'); 
const sequelize = require('../src/config/db/index');

async function createRoles() {
    const roles = [
        { RoleName: "admin" },
        { RoleName: "LeaderGroup" },
        { RoleName: "user" }
    ];

    for (const role of roles) {
        try {
            const existingRole = await Role.findOne({ where: { RoleName: role.RoleName } });
            if (existingRole) {
                console.log(`Role ${role.RoleName} already exists.`);
                continue; 
            }

            await Role.create(role);
            console.log(`Role ${role.RoleName} created.`);
        } catch (error) {
            console.error('Error creating role:', error);
        }
    }
}

sequelize.sync() 
    .then(() => createRoles())
    .then(() => console.log('Roles creation complete.'))
    .catch(error => console.error('Error syncing database:', error));
