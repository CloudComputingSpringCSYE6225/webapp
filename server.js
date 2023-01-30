import app from "./api/app.js"
import client from "./api/utils/DBConnection.js"
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 8080

app.listen(PORT, ()=> {
    console.log("Server Running on Port "+ PORT)
})

client.connect()