require("dotenv").config()

const cors = require("cors");

const express = require('express')

const app = express();

app.use(cors());

app.listen(3000,()=>console.log("listening in 3000"));

const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3');


aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,

});
const BUCKET = process.env.BUCKET
const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: "public-read",
        bucket: BUCKET,
        key: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
})

app.post('/upload', upload.single('file'), async function (req, res, next) {

    res.send('Successfully uploaded ');

})

app.get("/list", async (req, res) => {

    let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    let x = r.Contents.map(item => item.Key);
    res.send(x)
})

app.get("/listfull", async (req, res) => {

    let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    res.send(r.Contents)
})

app.get("/download/:filename", async (req, res) => {
    const filename = req.params.filename
    let x = await s3.getObject({ Bucket: BUCKET, Key: filename }).promise();
    res.send(x.Body)
    // const filename = req.params.filename
    // const fileLink = await s3.getSignedUrl('getObject',{ Bucket: BUCKET, Key: filename });
    // res.send(fileLink)
})

app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename
    await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();
    res.send("File Deleted Successfully")
})

app.get("/img/:filename", async (req, res) => {
    const filename = req.params.filename
    const fileLink = await s3.getSignedUrl('getObject',{ Bucket: BUCKET, Key: filename });
    res.send(fileLink)
})
