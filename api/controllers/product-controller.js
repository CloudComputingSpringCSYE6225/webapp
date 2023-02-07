//search a particular to-do object
import {setResponse} from "./index.js";

import db from "../models/index.js";
const Product = db.products

//express app invokes the function to create new product
export const create = async (req, res) => {
    try{
        const product = req.body
        if(!product.sku || !product.quantity)
            return setResponse({message: "SKU and Quantity are mandatory fields"}, 400, res)

        // if(!product.name || !product.description || !product.sku || !product.manufacturer || !product.quantity)
        //     return setResponse({message: "Name, Description, SKU, Manufacturer and Quantity are mandatory fields"}, 400, res)

        //Check if Product with the same SKU already exists
        const existingProduct = await Product.findOne({
            where: {
                sku: req.body.sku,
            },
        }).catch((error)=>  setResponse(error, 400, res))

        if(existingProduct)
            return setResponse({message: "Product with same SKU already exists"}, 400, res)

        if(product.quantity<0)
            return setResponse({message: "Product quantity cannot be less than 0"}, 400, res)

        if(product.quantity>100)
            return setResponse({message: "Product quantity cannot be more than 100"}, 400, res)

        // let parsedQuantity
        // try {
        //     parsedQuantity = JSON.parse(product.quantity);
        // } catch (err) {
        //     console.log(err)
        // }

        if (typeof product.quantity !== 'number')
            return setResponse({message: "Product quantity should be a number"}, 400, res)

        const validQuantity = String(product.quantity).match(/^\d+$/)
        if(!validQuantity)
            return setResponse({message: "Product quantity should be an integer"}, 400, res)

        product.owner_user_id = req.currUser.id

        await Product.create(product)
            .then((createdProduct)=>{
                // const responseObj = {
                //     id: createdProduct.id,
                //     name: createdProduct.name,
                //     description: createdProduct.description,
                //     sku: createdProduct.sku,
                //     manufacturer: createdProduct.manufacturer,
                //     quantity: createdProduct.quantity,
                //     date_added: createdProduct.date_added,
                //     date_last_updated: createdProduct.date_last_updated,
                //     owner_user_id: createdProduct.owner_user_id
                // }
                return setResponse(createdProduct, 201, res)})
            .catch((error)=> setResponse(error, 400, res))

    } catch (error) {
        return setResponse(error, 400, res)
    }

}

export const get = async (req, res) => {   //Search by id - auth required
    try{
        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  setResponse(error, 400, res))

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        return setResponse(foundProduct, 200, res)

    } catch (error){
        return setResponse(error, 400, res)
    }
}

export const put = async (req, res) => {
    try{
        const product = req.body
        if(!product.name)
            product.name=null
        if(!product.description)
            product.description=null
        if(!product.manufacturer)
            product.manufacturer=null
        if(!product.quantity)
            product.quantity=0

        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  setResponse(error, 400, res))

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        if(product.sku){
            const existingProduct = await Product.findOne({
                where: {
                    sku: req.body.sku,
                },
            }).catch((error)=>  setResponse(error, 400, res))

            if(existingProduct && foundProduct.sku!==req.body.sku)
                return setResponse({message: "Product with same SKU already exists"}, 400, res)
        } else {
            product.sku = foundProduct.sku
        }


        if(product.quantity){
            if(product.quantity<0)
                return setResponse({message: "Product quantity cannot be less than 0"}, 400, res)

            if(product.quantity>100)
                return setResponse({message: "Product quantity cannot be more than 100"}, 400, res)

            // let parsedQuantity
            // try {
            //     parsedQuantity = JSON.parse(product.quantity);
            //     console.log("ParsedQuantity Type: "+typeof product.quantity)
            // } catch (err) {
            //     console.log(err)
            // }

            if (typeof product.quantity !== 'number')
                return setResponse({message: "Product quantity should be a number"}, 400, res)

            const validQuantity = String(product.quantity).match(/^\d+$/)
            if(!validQuantity)
                return setResponse({message: "Product quantity should be an integer"}, 400, res)
        }

        product.owner_user_id = req.currUser.id;

        foundProduct.set(product)
        await foundProduct.save()
            .then(()=>setResponse({}, 204, res))
            .catch((error)=> setResponse(error, 400, res))
        // await Product.update(product, {
        //     where: { id: req.params.id },
        //     returning: true
        // })
        //     .then(async ()=>{
        //         const updatedProduct = await Product.findOne({
        //             where: { id: req.params.id }
        //         }).catch((error)=>  setResponse(error, 400, res))
        //
        //         const responseObj = {
        //                 id: updatedProduct.id,
        //                 name: updatedProduct.name,
        //                 description: updatedProduct.description,
        //                 sku: updatedProduct.sku,
        //                 manufacturer: updatedProduct.manufacturer,
        //                 quantity: updatedProduct.quantity,
        //                 date_added: updatedProduct.date_added,
        //                 date_last_updated: updatedProduct.date_last_updated,
        //                 owner_user_id: updatedProduct.owner_user_id
        //             }
        //         return setResponse(responseObj, 204, res)
        //     })
        //     .catch((error)=> setResponse(error, 400, res))

    } catch(error) {
        return setResponse(error, 400, res)
    }
}

export const patch = async (req, res) => {
    try{
        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  setResponse(error, 400, res))

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

        if(product.quantity){
            if(product.quantity<0)
                return setResponse({message: "Product quantity cannot be less than 0"}, 400, res)

            if(product.quantity>100)
                return setResponse({message: "Product quantity cannot be more than 100"}, 400, res)

            // let parsedQuantity
            // try {
            //     parsedQuantity = JSON.parse(product.quantity);
            // } catch (err) {
            //     console.log(err)
            // }

            if (typeof product.quantity !== 'number')
                return setResponse({message: "Product quantity should be a number"}, 400, res)

            const validQuantity = String(product.quantity).match(/^\d+$/)
            if(!validQuantity)
                return setResponse({message: "Product quantity should be an integer"}, 400, res)
        }

        await Product.update(product, {
            where: { id: req.params.id },
            returning: true
        })
            .then(async ()=>{
                const updatedProduct = await Product.findOne({
                    where: { id: req.params.id }
                }).catch((error)=>  setResponse(error, 400, res))

                // const responseObj = {
                //     id: updatedProduct.id,
                //     name: updatedProduct.name,
                //     description: updatedProduct.description,
                //     sku: updatedProduct.sku,
                //     manufacturer: updatedProduct.manufacturer,
                //     quantity: updatedProduct.quantity,
                //     date_added: updatedProduct.date_added,
                //     date_last_updated: updatedProduct.date_last_updated,
                //     owner_user_id: updatedProduct.owner_user_id
                // }
                return setResponse(updatedProduct, 204, res)
            })
            .catch((error)=> setResponse(error, 400, res))

    } catch(error) {
        return setResponse(error, 400, res)
    }
}

export const remove = async (req, res) => {
    try{
        const foundProduct = await Product.findOne({
            where: { id: req.params.id }
        })
            .catch((error)=>  setResponse(error, 400, res))

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        await foundProduct.destroy()
            .then(()=>setResponse({message: "Product successfully deleted"}, 204, res))
            .catch((error)=>  setResponse(error, 400, res))

    }catch(error) {
        return setResponse(error, 400, res)
    }
}
