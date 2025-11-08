// backend/middleware/upload.js
const multer = require("multer");

// Store in memory/disk temporarily
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;




// import aws from "aws-sdk";
// import multer from "multer";
// import multerS3 from "multer-s3";
// import dotenv from "dotenv";
// dotenv.config();

// // AWS config
// aws.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });

// const s3 = new aws.S3();

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.AWS_BUCKET_NAME,
//     acl: "public-read", // or "private" if you want restricted access
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, `uploads/${Date.now().toString()}-${file.originalname}`);
//     }
//   })
// });

// export default upload;
