import { DataTypes, Sequelize } from 'sequelize';

// Serverless-friendly configuration with connection pooling
const sequelize = new Sequelize(process.env.MYSQL_LUCPKERMS_URI!, {
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000
    }
})

const LuckPermsUserPermissions = sequelize.define('LuckPermsUserPermissions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    uuid: {
        type: DataTypes.STRING(36),
        allowNull: false,
    },
    permission: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    value: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    server: {
        type: DataTypes.STRING(36),
        allowNull: false,
    },
    world: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    expiry: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    contexts: {
        type: DataTypes.STRING(200),
        allowNull: false,
    }
}, {
    tableName: 'luckperms_user_permissions',
    timestamps: false,  // Eğer createdAt ve updatedAt sütunları yoksa
});

export default LuckPermsUserPermissions;