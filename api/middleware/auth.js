import {setResponse} from "../controllers/index.js";
import client from "../config/DBConnection.js";
import bcrypt from "bcrypt";

export const basicAuth = async (req, res, next) => {
    // If 'Authorization' header not present
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1){
        return setResponse({message: "Missing Authorization Header"}, 401, res)
    } else {
        // Decode the 'Authorization' header Base64 value
        const [username, password] = Buffer.from(req.get('Authorization').split(' ')[1], 'base64')
            // <Buffer 75 73 65 72 6e 61 6d 65 3a 70 61 73 73 77 6f 72 64>
            .toString()
            // username:password
            .split(':')
        // ['username', 'password']

        console.log("Middleware username: "+ username)
        console.log("Middleware pwd: "+ password)

        await client.query(`Select * from users where username='${username}'`, async (err, result)=>{
            try{
                if(result.rows.length===0){
                    // console.log("No such user")
                    return setResponse({message: "Please check username. Authorization in Middleware failed"}, 401, res)
                } else {
                    const validPassword = await bcrypt.compare(password, result.rows[0].password);
                    if (!validPassword)
                        return setResponse({message: "Password incorrect. Authorization in Middleware failed"}, 401, res)
                }

                req.currUser = {
                    id: result.rows[0].id,
                    username: result.rows[0].username,
                    password: result.rows[0].password
                }
                // Continue the execution
                next()
            }catch (error) {
                return setResponse(error, 401, res)
            }
        });
    }
}
