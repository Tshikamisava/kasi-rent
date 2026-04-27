import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const uploadPropertyImageToCloudinary = async (filePath, publicIdPrefix = 'property') => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  const folder = process.env.CLOUDINARY_FOLDER || 'kasirent/properties';
  const publicId = `${publicIdPrefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    public_id: publicId,
    resource_type: 'image',
    overwrite: false,
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' }
    ]
  });

  return result;
};
