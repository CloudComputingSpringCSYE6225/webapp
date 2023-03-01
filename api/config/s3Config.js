import aws from "aws-sdk"
import dotenv from "dotenv"
dotenv.config()

//Access key of dev profile

export const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_BUCKET_REGION
});