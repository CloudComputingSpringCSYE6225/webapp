//search a particular to-do object
import {setResponse} from "./index.js";
import * as fs from "fs";

import db from "../models/index.js";
const Product = db.products
const Image = db.images
import {upload, uploadFile} from "../middleware/multer.js";
import multer from "multer";
import {s3} from "../config/s3Config.js";

//express app invokes the function to create new image
export const create = async (req, res) => {
    let hasError = false
    try{

        if(req.body.image_id || req.body.product_id || req.body.file_name || req.body.date_created || req.body.s3_bucket_path){
            return setResponse({message: "Image Id, Product Id, File name, Date Created and Bucket path are Read Only Fields"}, 400, res)
        }
        //Product exists
        const foundProduct = await Product.findOne({
            where: { id: req.params.pid }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        //User autheticated
        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        //File is got or not
        if(!req.file)
            return setResponse({message: "Please Input a file"}, 400, res)

        const file = req.file
        // console.log(file)

        //Convert to stream to pass to S3
        const fileStream = fs.createReadStream(file.path)

        // Create a new image record in the database
        let createdImageId=0
        await Image.create({
            product_id: req.params.pid,
            file_name: req.file.originalname,
        })
            .then((createdImage)=>{
                createdImageId = createdImage.image_id
            })
            .catch((error)=> setResponse(error, 400, res))

        // Upload the image to S3
        let og_file_name = (req.file.originalname).replace(/\s/g, '')
        const params = {
            Bucket: 'rebdev-bucket',
            Key: `${req.params.pid}/${createdImageId}/${og_file_name}`,
            Body: fileStream,
            ContentType: req.file.mimetype
        };
        const uploaded = await s3.upload(params).promise();

        //Put s3_bucket_path in the Image db
        await Image.update({s3_bucket_path: uploaded.Key}, {
            where: { image_id: createdImageId },
            returning: true
        })
            .then(async ()=>{
                const updatedImage = await Image.findOne({
                    where: { image_id: createdImageId }
                }).catch((error)=>  setResponse(error, 400, res))
                // console.log(updatedImage)
                return setResponse(updatedImage, 201, res)
            })
            .catch((error)=> setResponse(error, 400, res))

    } catch (error) {
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

export const getAll = async (req, res) => {
    let hasError = false
    try{
        //Product exists
        const foundProduct = await Product.findOne({
            where: { id: req.params.pid }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        //User autheticated
        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        const foundImages = await Image.findAll({
            where: { product_id: req.params.pid }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        const list = []
        foundImages.forEach(image => {
            list.push(image.dataValues)
        })

        return setResponse(list, 200, res)
    }catch (error){
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

export const get = async (req, res) => {
    let hasError = false
    try{
        //Product exists
        const foundProduct = await Product.findOne({
            where: { id: req.params.pid }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        //User authenticated
        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        //Image exists
        const foundImage = await Image.findOne({
            where: { image_id: req.params.id }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundImage)
            return setResponse({message: "No such Image. Please check id"}, 404, res)

        return setResponse(foundImage, 200, res)

    } catch (error){
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

export const remove = async (req, res) => {
    let hasError = false
    try{
        //Product exists
        const foundProduct = await Product.findOne({
            where: { id: req.params.pid }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundProduct)
            return setResponse({message: "No such Product. Please check id"}, 404, res)

        //User authenticated
        if(foundProduct.owner_user_id!==req.currUser.id)
            return setResponse({message: "You don't have access to this Product"}, 403, res)

        //Image exists
        const foundImage = await Image.findOne({
            where: { image_id: req.params.id }
        })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

        if(!foundImage)
            return setResponse({message: "No such Image. Please check id"}, 404, res)

        const params = {
            Bucket: 'rebdev-bucket',
            Key: foundImage.s3_bucket_path,
        };
        await s3.deleteObject(params).promise()
            .then(async ()=> {
                console.log("Image deleted from s3 bucket")
                await foundImage.destroy()
                    .then(()=>setResponse({message: "Image successfully deleted"}, 204, res))
                    .catch((error)=>  setResponse(error, 400, res))
            })
            .catch((error)=>  {
                hasError = true
                return setResponse(error, 400, res)})

    }catch(error) {
        if(!hasError)
            return setResponse(error, 400, res)
    }
}

