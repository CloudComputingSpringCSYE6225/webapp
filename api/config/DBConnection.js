import pg from "pg"
const { Client } = pg
import dotenv from "dotenv"
dotenv.config()

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

export default client