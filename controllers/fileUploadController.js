const { uploadFile } = require("./s3Upload");

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }
    const bucketName = "git-repoclone-bucket";
    const filePath = file.originalname;
    const fileUrl = await uploadFile(bucketName, filePath, file.buffer);
    res.status(200).send({ fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to upload file.");
  }
};

exports.deleteFileFromS3 = async (bucketName, fileKey) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
    console.log(`File ${fileKey} deleted from ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${fileKey} from ${bucketName}`, error);
    return false;
  }
};
