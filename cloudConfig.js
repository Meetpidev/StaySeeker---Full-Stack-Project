const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_APIKEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'project_DEV',
        allowedFormats: ["png", "jpg", "jpeg"], // Corrected typo from 'allowerdFormats' to 'allowedFormats'
    },
});

module.exports = {
    cloudinary,
    storage,
};
