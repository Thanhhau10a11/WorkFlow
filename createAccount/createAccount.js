

const { AppUser, Role, UserRole } = require('../src/app/models/index'); 
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db/index'); 

async function createTestAccounts() {
    const testUsers = [
        { name: "Admin User", username: "hau69710@gmail.com", password: "password", Role: "admin" }, 
        { name: "Leader Group User", username: "hau6971024@gmail.com", password: "password", Role: "LeaderGroup" }, 
        { name: "Regular User", username: "hau697102@gmail.com", password: "password", Role: "user" } 
    ];

    for (const user of testUsers) {
        try {
            const existingUser = await AppUser.findOne({ where: { Username: user.username } });
            if (existingUser) {
                console.log(`User ${user.username} already exists.`);
                continue; 
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = await AppUser.create({ Name: user.name, Username: user.username, Password: hashedPassword ,Role:user.Role});

            const roleRecord = await Role.findOne({ where: { RoleName: user.Role } }); 
            if (roleRecord) {
                await UserRole.create({ IDUser: newUser.IDUser, RoleID: roleRecord.RoleID }); 
                console.log(`User ${user.username} created with role ${user.Role}.`);
            } else {
                console.log(`Role ${user.Role} does not exist.`);
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }
}

sequelize.sync() 
    .then(() => createTestAccounts())
    .then(() => console.log('Test accounts creation complete.'))
    .catch(error => console.error('Error syncing database:', error));
