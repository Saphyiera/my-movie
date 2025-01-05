require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const uuid = require('uuid').v7;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBase64Image = async (base64Image) => {
    try {
        const uniqueFilename = `${uuid()}`;
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
            public_id: uniqueFilename,
            overwrite: true,
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        console.log('Image uploaded successfully:', result.url);
        return result.url;
    } catch (error) {
        console.error('Error uploading base64 image to Cloudinary:', error);
        throw error;
    }
};

module.exports = uploadBase64Image