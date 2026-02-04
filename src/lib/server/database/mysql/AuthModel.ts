import { DataTypes, Sequelize } from 'sequelize';

// Serverless-friendly configuration with connection pooling
const sequelize = new Sequelize(process.env.MYSQL_AUTH_URI!, {
    dialect: 'mysql',
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

const Auth = sequelize.define('Auth', {
    NICKNAME: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    LOWERCASENICKNAME: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
    },
    HASH: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    IP: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    TOTPTOKEN: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    REGDATE: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    UUID: {
        type: DataTypes.STRING(36),
        allowNull: true,
    },
    PREMIUMUUID: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    LOGINIP: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    LOGINDATE: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    ISSUEDTIME: {
        type: DataTypes.BIGINT,
        allowNull: true,
    }
}, {
    tableName: 'AUTH',
    timestamps: false,
});

export default Auth;