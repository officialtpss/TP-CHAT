require('dotenv').config()

module.exports = {
    DBNAME: process.env.DB_NAME,
    PORT: process.env.PORT,
    JWT_SECRET:process.env.JWT_SECRET,
};