const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.SECRET_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_SECRET,
  region: "ap-south-1",
});

const s3 = new AWS.S3();

const uploadFile = async (bucketName, filePath, fileBuffer) => {
  const params = {
    Bucket: bucketName,
    Key: filePath,
    Body: fileBuffer,
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

module.exports = {
  uploadFile,
};
