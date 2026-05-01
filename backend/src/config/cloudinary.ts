import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  filePath: string,
  folder: string = 'nexford'
): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
  });
  return result.secure_url;
};

export const uploadFile = async (
  filePath: string,
  folder: string = 'nexford/files'
): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'raw',
  });
  return result.secure_url;
};

export const deleteFile = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
