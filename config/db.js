const dotenv = require("dotenv").config()
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: { rejectUnauthorized: false },
});
pool.connect().
    then(() =>
        console.log("DB Connected")).
    catch(error => console.log(error, "Error occuring in DB connection"))
    
module.exports = pool;