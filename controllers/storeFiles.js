const AWS = require("aws-sdk");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

// Configure AWS credentials
AWS.config.update({
  accessKeyId: process.env.SECRET_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_SECRET,
  region: "ap-south-1",
});

// Create an instance of the S3 service
const s3 = new AWS.S3();

// Function to upload a file to S3 bucket
const uploadFile = (bucketName, filePath) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: bucketName,
    Key: filePath,
    Body: fileContent,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};

// Function to upload a folder to S3 bucket
const uploadFolder = async (bucketName, folderPath) => {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = `${folderPath}/${file}`;

    if (fs.lstatSync(filePath).isDirectory()) {
      await uploadFolder(bucketName, filePath);
    } else {
      await uploadFile(bucketName, filePath);
    }
  }
};

module.exports = {
  uploadFile,
  uploadFolder,
};
