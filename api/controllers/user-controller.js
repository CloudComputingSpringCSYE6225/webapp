//search a particular to-do object
import {setResponse} from "./index.js";
import bcrypt from "bcrypt";
import client from "../utils/DBConnection.js";

//express app invokes the function to create new user
export const create = async (req, res) => {
    try{
        //Check if User with the same email already exists
        let userExists = false
        client.query(`Select * from users where username='${req.body.username}'`)
            .then((result)=>{
                if(result.rows.length>0){
                                console.log("User already exists")
                                userExists = true
                                return setResponse({message: "Username already exists"}, 400, res)
                            }
                })
            .then(async ()=>{
                if(userExists)
                    return

                const user = req.body
                const validEmail = String(user.username)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )
                if(!validEmail)
                    return setResponse({message: "Username should be an Email ID"}, 400, res)

                const salt = await bcrypt.genSalt()
                user.password = await bcrypt.hash(user.password, salt)

                if(user.account_created || user.account_updated || user.id)
                    return setResponse({message: "ID, Account created and updated are read only fields"}, 400, res)

                const insertQuery = `insert into users(first_name, last_name, password, username)
                               values('${user.first_name}', '${user.last_name}', '${user.password}', '${user.username}') RETURNING *`

                //Todo - Convert to promise chaining later
                await client.query(insertQuery, (err, result)=>{
                        try{
                            console.log("Successful creation: " + result.rows)
                            //Obtain Base64 encoding
                            const concatString = user.username+":"+req.body.password;
                            const base64String = genBase64(concatString)

                            console.log("Base 64 on creation of user: "+base64String)
                            const responseObj = {
                                id: result.rows[0].id,
                                first_name: result.rows[0].first_name,
                                last_name: result.rows[0].last_name,
                                username: result.rows[0].username,
                                account_created: result.rows[0].account_created,
                                account_updated: result.rows[0].account_updated
                            }
                            return setResponse(responseObj, 200, res)
                        } catch (error) {
                            return setResponse(error, 400, res)
                        }
                    })
            })
            .catch((error)=>  setResponse(error, 400, res))
        client.end;
    } catch (error) {
        return setResponse(error, 400, res)
    }

}

export const login = async (req, res) => {
    try{
        const user = req.body
        let existingPassword = ""
        let validPassword = false
        client.query(`Select password from users where username='${req.body.username}'`, async (err, result)=>{
            try{
                if(result.rows.length===0){
                    console.log("No such user")
                    return setResponse({message: "Please check username"}, 400, res)
                }

                existingPassword = result.rows[0].password
                console.log("Existing Pwd: "+ existingPassword)
                console.log("Body Pwd: "+ user.password)
                validPassword = await bcrypt.compare(user.password, existingPassword);
                console.log(validPassword)
                if (!validPassword)
                    return setResponse({message: "Password incorrect"}, 400, res)

                //Obtain Base64 encoding
                const concatString = user.username+":"+req.body.password;
                console.log("concatString in login"+concatString)
                const base64String = genBase64(concatString)
                console.log("Base 64 on login of user: "+base64String)

                return setResponse({base64: base64String}, 200, res)

            }catch (error) {
                return setResponse(error, 400, res)
            }
        });

        client.end;
    } catch (error) {
        return setResponse(error, 400, res)
    }
}

export const get = async (req, res) => {   //Search by id - auth required
    try{
        if(req.currUser.id!==req.params.id){
            return setResponse({message: "You don't have access to this User account"}, 403, res)
        } else {
            client.query(`Select * from users where id='${req.params.id}'`, async (err, result)=>{
                try{
                    if(result.rows.length===0){
                        console.log("No such user")
                        return setResponse({message: "Please check username"}, 400, res)
                    }
                    else {
                        const responseObj = {
                            id: result.rows[0].id,
                            first_name: result.rows[0].first_name,
                            last_name: result.rows[0].last_name,
                            username: result.rows[0].username,
                            account_created: result.rows[0].account_created,
                            account_updated: result.rows[0].account_updated
                        }
                        return setResponse(responseObj, 200, res)
                    }
                }catch (error) {
                    return setResponse(error, 400, res)
                }
            });
        }
    } catch (error){
        return setResponse(error, 400, res)
    }
}

//Update user info - auth required
export const update = async (req, res) => {
    try{
        const user = req.body
        if(req.currUser.id!==req.params.id){
            return setResponse({message: "You don't have access to this User account"}, 403, res)
        } else if(user.username){
            return setResponse({message: "Username cannot be updated"}, 400, res)
        } else if(user.account_created || user.account_updated || user.id)
            return setResponse({message: "ID, Account created and updated are read only fields"}, 400, res)
        else {
            const salt = await bcrypt.genSalt()
            user.password = await bcrypt.hash(user.password, salt)

            const updateQuery = `update users
                                 set first_name = '${user.first_name}',
                                     last_name = '${user.last_name}',
                                     password = '${user.password}'
                                 where id = ${req.currUser.id}`

            client.query(updateQuery, (err, result)=>{
                try{
                    console.log("Successful updation: " + result.rows)

                    //Obtain Base64 encoding
                    const concatString = req.currUser.username+":"+req.body.password;
                    console.log("concatString in creation"+concatString)
                    const base64String = genBase64(concatString)

                    console.log("Base 64 on updation of user: "+base64String)
                    return setResponse({message: "User successfully updated"}, 200, res)
                } catch (error) {
                    return setResponse(error, 400, res)
                }
            })

            client.end;
        }
    } catch(error) {
        return setResponse(error, 400, res)
    }
}

const genBase64 = (concatString) => {
    const bufferObj = Buffer.from(concatString, "utf8");

    // Encode the Buffer as a base64 string
    const base64String = bufferObj.toString("base64");
    return base64String
}