require('dotenv').config();
// const { Client } = require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cmpt372project',
    retry: {
        max: 10,
        timeout: 60000
    },
    dialectOptions: {
        socketPath: process.env.DB_HOST || 'localhost'
    },
    logging: false
});

// Models
const Message = require('./models/Message')(sequelize);
const User = require('./models/User')(sequelize);
const Chat = require('./models/Chat')(sequelize);
const Comment = require('./models/Comment')(sequelize);
const Project = require('./models/Project')(sequelize);
const List = require('./models/List')(sequelize);
const Task = require('./models/Task')(sequelize);
const File = require('./models/File')(sequelize);
const Role = require('./models/Role')(sequelize);
const UserProject = require('./models/UserProject')(sequelize);

// Define relationships
// Chat
Chat.hasMany(Message, { foreignKey: 'chatId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });
User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });
// UserChat junction
User.belongsToMany(Chat, { through: 'UserChat' });
Chat.belongsToMany(User, { through: 'UserChat' });
// ProjectChat junction
Project.belongsToMany(Chat, { through: 'ProjectChat' });
Chat.belongsToMany(Project, { through: 'ProjectChat' });

// Project
// UserProject junction
// User.belongsToMany(Project, { through: 'UserProject' });
// Project.belongsToMany(User, { through: 'UserProject' });

// UserProject junction, with Role
User.belongsToMany(Project, { through: UserProject });
Project.belongsToMany(User, { through: UserProject });
UserProject.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(UserProject, { foreignKey: 'roleId' });

Project.hasMany(List, { foreignKey: 'projectId' });
List.belongsTo(Project, { foreignKey: 'projectId' });
// Task
List.hasMany(Task, { foreignKey: 'listId' });
Task.belongsTo(List, { foreignKey: 'listId' });
// UserTask junction
Task.belongsToMany(User, { through: 'UserTask' });
User.belongsToMany(Task, { through: 'UserTask' });
// TaskComment junction
Task.belongsToMany(Comment, { through: 'TaskComment' });
Comment.belongsToMany(Task, { through: 'TaskComment' });
Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

// File
// TaskFile junction
Task.belongsToMany(File, { through: 'TaskFile' });
File.belongsToMany(Task, { through: 'TaskFile' });
// ProjectFile junction
Project.belongsToMany(File, { through: 'ProjectFile' });
File.belongsToMany(Project, { through: 'ProjectFile' });

(async () => {
    await sequelize.sync({
        // alter: true,
        logging: false
    });

    // Populate Role table if empty when starting application, there are only 3 roles
    const roles = ['Owner', 'Editor', 'Viewer'];
    Role.findAndCountAll().then(result => {
        if (result.count === 0) {
            roles.forEach(role => {
                Role.create({ name: role })
                    .catch(error => console.error(`Error creating role ${role}:`, error));
            });
        }
    });
})();

module.exports = {
    sequelize,
    Message,
    User,
    Chat,
    Comment,
    Project,
    List,
    Task,
    File,
    Role,
    UserProject,
};