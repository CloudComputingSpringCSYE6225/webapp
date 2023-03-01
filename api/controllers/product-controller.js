//search a particular to-do object
import {setResponse} from "./index.js";

import db from "../models/index.js";
const Product = db.products

//express app invokes the function to create new product
export const create = async (req, res) => {
    try{
        const product = req.body

        if(!product.name || !product.description || !product.sku || !product.manufacturer || !product.quantity)
            return setResponse({message: "Name, Description, SKU, Manufacturer and Quantity are mandatory fields"}, 400, res)

        //Check if Product with the same SKU already exists
        const existingProduct = await Product.findOne({
            where: {
                sku: req.body.sku,
            },
        }).catch((error)=>  setResponse(error, 400, res))

        if(existingProduct)
            return setResponse({message: "Product with same SKU already exists"}, 400, res)

        if(product.date_added || product.date_last_updated || product.id || product.owner_user_id)
            return setResponse({message: "ID, Owner User Id, Date added and updated are read only fields"}, 400, res)

        //Check if Quantity is valid
        const {message, status} = checkQuantity(product.quantity)
        if(!status)
            return setResponse({message}, 400, res)
        
        //Check if Manufacturer is a string
        if(typeof product.manufacturer!=="string")
            return setResponse({message: "Manufacturer should be a string"}, 400, res)

        product.owner_user_id = req.currUser.id

        await Product.create(product)
            .then((createdProduct)=>{

                return setResponse(createdProduct, 201, res)})
            .catch((error)=> setResponse(error, 400, res))

    } catch (error) {
        return setResponse(error, 400, res)
    }

}

export const get = async (req, res) => {   //Search by id - auth required
    let hasError = false
    try{
        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        return setResponse(foundProduct, 200, res)

    } catch (error){
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

export const put = async (req, res) => {
    let hasError = false
    try{
        const product = req.body

        if(!product.name || !product.description || !product.sku || !product.manufacturer || !product.quantity)
            return setResponse({message: "Name, Description, SKU, Manufacturer and Quantity are mandatory fields"}, 400, res)

        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        if(product.date_added || product.date_last_updated || product.id || product.owner_user_id)
            return setResponse({message: "ID, Owner User Id, Date added and updated are read only fields"}, 400, res)

        const existingProduct = await Product.findOne({
            where: {
                sku: req.body.sku,
            },
        }).catch((error)=>  setResponse(error, 400, res))

        if(existingProduct && foundProduct.sku!==req.body.sku)
            return setResponse({message: "Product with same SKU already exists"}, 400, res)

        //Check if quantity is valid
        const {message, status} = checkQuantity(product.quantity)
        if(!status)
            return setResponse({message}, 400, res)

        //Check if Manufacturer is a string
        if(typeof product.manufacturer!=="string")
            return setResponse({message: "Manufacturer should be a string"}, 400, res)

        product.owner_user_id = req.currUser.id;

        await Product.update(product, {
            where: { id: req.params.id },
            returning: true
        })
            .then(async ()=>{
                const updatedProduct = await Product.findOne({
                    where: { id: req.params.id }
                }).catch((error)=>  setResponse(error, 400, res))

                const responseObj = {
                        id: updatedProduct.id,
                        name: updatedProduct.name,
                        description: updatedProduct.description,
                        sku: updatedProduct.sku,
                        manufacturer: updatedProduct.manufacturer,
                        quantity: updatedProduct.quantity,
                        date_added: updatedProduct.date_added,
                        date_last_updated: updatedProduct.date_last_updated,
                        owner_user_id: updatedProduct.owner_user_id
                    }
                return setResponse(responseObj, 204, res)
            })
            .catch((error)=> setResponse(error, 400, res))


    } catch(error) {
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

export const patch = async (req, res) => {
    let hasError = false
    try{
        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=> {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        const product = req.body

        if(product.sku){
            const existingProduct = await Product.findOne({
                where: {
                    sku: req.body.sku,
                },
            }).catch((error)=>  setResponse(error, 400, res))

            if(existingProduct && foundProduct.sku!==req.body.sku)
                return setResponse({message: "Product with same SKU already exists"}, 400, res)
        }

        if(product.date_added || product.date_last_updated || product.id || product.owner_user_id)
            return setResponse({message: "ID, Owner User Id, Date added and updated are read only fields"}, 400, res)

        if(product.quantity){
            //Check if quantity is valid
            const {message, status} = checkQuantity(product.quantity)
            if(!status)
                return setResponse({message}, 400, res)
        }

        if(product.manufacturer){
            if(typeof product.manufacturer!=="string")
                return setResponse({message: "Manufacturer should be a string"}, 400, res)
        }

        await Product.update(product, {
            where: { id: req.params.id },
            returning: true
        })
            .then(async ()=>{
                const updatedProduct = await Product.findOne({
                    where: { id: req.params.id }
                }).catch((error)=>  setResponse(error, 400, res))

                return setResponse(updatedProduct, 204, res)
            })
            .catch((error)=> setResponse(error, 400, res))

    } catch(error) {
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

export const remove = async (req, res) => {
    let hasError = false
    try{
        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        await foundProduct.destroy()
            .then(()=>setResponse({message: "Product successfully deleted"}, 204, res))
            .catch((error)=>  setResponse(error, 400, res))

    }catch(error) {
        if(!hasError)
            return setResponse(error, 400, res)
    }
}


const checkQuantity = (quantity)=>{
    if (typeof quantity !== 'number')
        return {message: "Product quantity should be a number and not a string", status: false}

    if(quantity<0)
        return {message: "Product quantity cannot be less than 0", status: false}

    if(quantity>100)
        return {message: "Product quantity cannot be more than 100", status: false}

    // let parsedQuantity
    // try {
    //     parsedQuantity = JSON.parse(product.quantity);
    // } catch (err) {
    //     console.log(err)
    // }

    const validQuantity = String(quantity).match(/^\d+$/)
    if(!validQuantity)
        return {message: "Product quantity should be an integer", status: false}

    return {message: "Valid Quantity", status: true}
}
