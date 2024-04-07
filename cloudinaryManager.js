const cloudinary = require('cloudinary').v2;
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  const imageExistenceCache = {};
  // Function to upload a single image to Cloudinary
  async function uploadImageToCloudinary(localFilePath) {
    const fileName = path.basename(localFilePath);
    const publicId = `${process.env.CLOUDINARY_FOLDER}/${path.parse(fileName).name}`;
  
   // console.log(`Attempting to check or upload image: ${fileName}`);
  
    try {
      // Check local cache first to see if the image was previously deleted
      if (imageExistenceCache[publicId] === false) {
       // console.log(`Image was deleted from Cloudinary, re-uploading: ${fileName}`);
        // Clear the cache entry since we're going to re-upload the image
        delete imageExistenceCache[publicId];
      } else {
        // Check if the image is already uploaded to avoid re-uploading
        const resource = await cloudinary.api.resource(publicId);
       // console.log(`Image ${fileName} is already uploaded. Resource ID: ${resource.public_id}`);
        return; // Image exists, no need to re-upload
      }
    } catch (error) {
      if (error.error && error.error.http_code === 404) {
        // Image not found in Cloudinary, proceed with upload
      } else {
        // Log the entire error object to see all properties
        // console.error('Error checking Cloudinary:', error);
        return; 
      }
    }
    
    // Proceed with uploading the image
    const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
      folder: process.env.CLOUDINARY_FOLDER,
      public_id: path.parse(fileName).name,
      overwrite: false,
      
    });
   // console.log(`Upload successful. Public ID: ${uploadResponse.public_id}`);
  }
  
  async function deleteImageFromCloudinary(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
     // console.log(`Deleted image with Public ID: ${publicId}`, result);
      
      // Update the local cache to indicate the image has been deleted
      if (result.result === 'ok') {
        imageExistenceCache[publicId] = false;
      }
    } catch (error) {
      // console.error(`Error deleting image with Public ID: ${publicId}`, error);
    }
  }
  
  function setupWatcher() {
    const watcher = chokidar.watch('public/images', {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: true, 
    });
  
    watcher
      .on('add', (filePath) => {
       // console.log(`File ${filePath} has been added`);
        uploadImageToCloudinary(filePath).catch(console.error);
      })
      .on('unlink', (filePath) => {
       // console.log(`File ${filePath} has been removed`);
        // Extract the file name without the extension to use as the public ID
        const fileName = path.basename(filePath, path.extname(filePath));
        const publicId = `${process.env.CLOUDINARY_FOLDER}/${fileName}`;
        deleteImageFromCloudinary(publicId).catch(console.error);
      })
      .on('error', (error) => console.error(`Watcher error: ${error}`));
  }
  
  // Function to upload all existing images in the directory to Cloudinary
  async function uploadExistingImages(directory) {
    const files = fs.readdirSync(directory);
  
    for (const file of files) {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isFile() && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)) {
        await uploadImageToCloudinary(filePath).catch(console.error);
      }
    }
  }



// Export the setup functions
module.exports = {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    setupWatcher,
    uploadExistingImages,
    imageExistenceCache,
  };